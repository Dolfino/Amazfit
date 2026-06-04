import io
import os
import zipfile
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
from database import engine, get_db, DATABASE_URL
from fit_processor import FitProcessor

# Automatically create database tables if they do not exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Amazfit FIT Parser Backend",
    description="Stateless and persistent parser backend for FIT files from Amazfit GTR 3 devices",
    version="2.0.0"
)

# Enable CORS for local development and Kubernetes routing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def process_and_save_fit(contents: bytes, db: Session) -> models.Activity:
    """
    Helper function to parse a FIT file and write it to the database, overwriting duplicates.
    """
    processor = FitProcessor(contents)
    processor.parse()
    payload = processor.get_json_payload()
    
    # Sanitize NaN/Inf values BEFORE database insertion
    # PostgreSQL strictly rejects NaN in JSON columns (RFC 7159 compliance)
    payload = models.sanitize_json_values(payload)
    
    # Extract UTC start time
    start_dt = processor.records_df['timestamp'].min()
    if hasattr(start_dt, 'to_pydatetime'):
        start_dt = start_dt.to_pydatetime()
        
    # Check duplicate start time to prevent database bloat
    existing = db.query(models.Activity).filter(models.Activity.start_time_utc == start_dt).first()
    if existing:
        db.delete(existing)
        db.commit()
        
    # Map payload properties to database model
    metadata = payload["metadata"]
    summary = payload["summary"]
    biomechanics = payload["biomechanics"]
    
    db_activity = models.Activity(
        device_name=metadata.get("device_name", "Amazfit GTR 3"),
        start_time_local=metadata.get("start_time_local", "N/A"),
        start_time_utc=start_dt,
        distance_km=summary.get("distance_km", 0.0),
        duration_sec=summary.get("duration_sec", 0.0),
        avg_pace=summary.get("avg_pace", "00'00\""),
        best_pace=summary.get("best_pace", "00'00\""),
        avg_hr=summary.get("avg_hr"),
        max_hr=summary.get("max_hr"),
        min_hr=summary.get("min_hr"),
        ascent_m=summary.get("ascent_m", 0.0),
        descent_m=summary.get("descent_m", 0.0),
        calories=summary.get("calories", 0),
        training_load=summary.get("training_load", 0),
        aerobic_te=summary.get("aerobic_te", 0.0),
        anaerobic_te=summary.get("anaerobic_te", 0.0),
        avg_cadence_spm=summary.get("avg_cadence_spm", 0.0),
        max_cadence_spm=summary.get("max_cadence_spm", 0.0),
        avg_step_len_mm=summary.get("avg_step_len_mm", 0.0),
        estimated_steps=summary.get("estimated_steps", 0),
        sport=metadata.get("sport", "running"),
        sub_sport=metadata.get("sub_sport"),
        file_created_time=metadata.get("file_created_time"),
        activity_type=metadata.get("activity_type", "manual"),
        gps_quality_pct=metadata.get("gps_quality_pct", 100.0),
        gps_points_count=metadata.get("gps_points_count", 0),
        min_elevation=summary.get("min_elevation", 0.0),
        max_elevation=summary.get("max_elevation", 0.0),
        avg_elevation=summary.get("avg_elevation", 0.0),
        huami_secret_xxx168=metadata.get("huami_secret_xxx168", 0),
        
        hr_zones=payload.get("hr_zones"),
        biomechanics=biomechanics,
        peak_hr=payload.get("peak_hr"),
        gps_path=payload.get("gps_path"),
        chart_series=payload.get("chart_series"),
        laps=payload.get("laps"),
        timeline_events=payload.get("timeline_events"),
        developer_data=metadata.get("developer_data"),
        developer_fields=metadata.get("developer_fields"),
        message_counts=metadata.get("message_counts"),
        
        gpx_data=processor.to_gpx(),
        csv_data=processor.to_csv()
    )
    
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@app.post("/api/upload")
async def upload_fit_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Single FIT file upload endpoint. Parses and saves the activity to the database.
    """
    if not file.filename.lower().endswith('.fit'):
        raise HTTPException(status_code=400, detail="Only .fit files are accepted.")
    
    try:
        contents = await file.read()
        db_activity = process_and_save_fit(contents, db)
        return db_activity.to_dict()
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error parsing FIT file: {str(e)}")

@app.post("/api/upload/batch")
async def upload_batch_files(files: list[UploadFile] = File(...), db: Session = Depends(get_db)):
    """
    Batch upload files: processes list of files, extracts ZIP archives, saving all FIT files to DB.
    """
    success_count = 0
    skipped_count = 0
    failed_count = 0
    imported_activities = []
    
    for file in files:
        if file.filename.lower().endswith('.zip'):
            try:
                zip_contents = await file.read()
                with zipfile.ZipFile(io.BytesIO(zip_contents)) as z:
                    for z_name in z.namelist():
                        # Skip directory entries or macOS metadata
                        if z_name.lower().endswith('.fit') and not z_name.startswith('__MACOSX') and '/' not in z_name:
                            fit_data = z.read(z_name)
                            try:
                                act = process_and_save_fit(fit_data, db)
                                success_count += 1
                                imported_activities.append({
                                    "filename": z_name,
                                    "status": "success",
                                    "id": act.id,
                                    "distance_km": act.distance_km,
                                    "start_time": act.start_time_local
                                })
                            except Exception:
                                failed_count += 1
            except Exception:
                failed_count += 1
        elif file.filename.lower().endswith('.fit'):
            try:
                fit_data = await file.read()
                act = process_and_save_fit(fit_data, db)
                success_count += 1
                imported_activities.append({
                    "filename": file.filename,
                    "status": "success",
                    "id": act.id,
                    "distance_km": act.distance_km,
                    "start_time": act.start_time_local
                })
            except Exception:
                failed_count += 1
        else:
            skipped_count += 1
            
    return {
        "success_count": success_count,
        "failed_count": failed_count,
        "skipped_count": skipped_count,
        "activities": imported_activities
    }

@app.get("/api/activities")
def list_activities(db: Session = Depends(get_db)):
    """
    List all recorded activities (lightweight payload for dashboard catalog).
    """
    activities = db.query(models.Activity).order_by(models.Activity.start_time_utc.desc()).all()
    res = [
        {
            "id": a.id,
            "device_name": a.device_name,
            "sport": a.sport,
            "sub_sport": a.sub_sport,
            "start_time_local": a.start_time_local,
            "distance_km": a.distance_km,
            "duration_sec": a.duration_sec,
            "avg_pace": a.avg_pace,
            "avg_hr": a.avg_hr,
            "max_hr": a.max_hr,
            "training_load": a.training_load,
            "calories": a.calories,
            "estimated_steps": a.estimated_steps,
            "ascent_m": a.ascent_m,
            "descent_m": a.descent_m
        }
        for a in activities
    ]
    return models.sanitize_json_values(res)

@app.get("/api/activities/{activity_id}")
def get_activity_detail(activity_id: int, db: Session = Depends(get_db)):
    """
    Retrieve full payload details for a single activity.
    """
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity.to_dict()

@app.delete("/api/activities/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    """
    Delete an activity from the database.
    """
    activity = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(activity)
    db.commit()
    return {"status": "success", "message": f"Activity {activity_id} deleted."}

@app.get("/api/activities/stats/summary")
def get_long_term_stats(db: Session = Depends(get_db)):
    """
    Generate long-term volume aggregates and metrics trends.
    """
    activities = db.query(models.Activity).order_by(models.Activity.start_time_utc.asc()).all()
    if not activities:
        return {
            "monthly_volume": [],
            "pace_trend": [],
            "hr_trend": []
        }
        
    monthly = {}
    pace_trend = []
    hr_trend = []
    
    for a in activities:
        dt = a.start_time_utc
        if not dt:
            continue
        month_str = dt.strftime('%Y-%m')
        
        # Monthly aggregates
        if month_str not in monthly:
            monthly[month_str] = {"month": month_str, "distance_km": 0.0, "duration_sec": 0.0, "count": 0}
        monthly[month_str]["distance_km"] += a.distance_km
        monthly[month_str]["duration_sec"] += a.duration_sec
        monthly[month_str]["count"] += 1
        
        # Convert pace string e.g. "14'45\"" to decimal minutes
        pace_dec = None
        if a.avg_pace:
            try:
                parts = a.avg_pace.replace('"', '').split("'")
                if len(parts) == 2:
                    pace_dec = float(parts[0]) + float(parts[1]) / 60.0
            except Exception:
                pass
                
        date_str = dt.strftime('%Y-%m-%d')
        pace_trend.append({
            "date": date_str,
            "pace_decimal": pace_dec,
            "pace_str": a.avg_pace,
            "distance_km": a.distance_km
        })
        
        hr_trend.append({
            "date": date_str,
            "avg_hr": a.avg_hr,
            "min_hr": a.min_hr,
            "max_hr": a.max_hr
        })
        
    return models.sanitize_json_values({
        "monthly_volume": list(monthly.values()),
        "pace_trend": pace_trend,
        "hr_trend": hr_trend
    })

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint for probes.
    """
    return {"status": "healthy", "database": DATABASE_URL.split("://")[0] if "://" in DATABASE_URL else "sqlite"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
