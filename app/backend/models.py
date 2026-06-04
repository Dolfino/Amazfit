import datetime
import math
from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, Text
from database import Base

def sanitize_json_values(val):
    if isinstance(val, float):
        if math.isnan(val) or math.isinf(val):
            return None
        return val
    elif hasattr(val, '__float__') and not isinstance(val, (int, str, bool, dict, list, tuple)):
        try:
            fval = float(val)
            if math.isnan(fval) or math.isinf(fval):
                return None
            return fval
        except Exception:
            pass
    elif isinstance(val, dict):
        return {k: sanitize_json_values(v) for k, v in val.items()}
    elif isinstance(val, list):
        return [sanitize_json_values(v) for v in val]
    elif isinstance(val, tuple):
        return tuple(sanitize_json_values(v) for v in val)
    return val

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    device_name = Column(String, index=True)
    start_time_local = Column(String, index=True)
    start_time_utc = Column(DateTime, index=True)
    distance_km = Column(Float)
    duration_sec = Column(Float)
    avg_pace = Column(String)
    best_pace = Column(String)
    avg_hr = Column(Integer, nullable=True)
    max_hr = Column(Integer, nullable=True)
    min_hr = Column(Integer, nullable=True)
    ascent_m = Column(Float)
    descent_m = Column(Float)
    calories = Column(Integer)
    training_load = Column(Integer)
    aerobic_te = Column(Float)
    anaerobic_te = Column(Float)
    avg_cadence_spm = Column(Float)
    max_cadence_spm = Column(Float)
    avg_step_len_mm = Column(Float)
    estimated_steps = Column(Integer)
    sport = Column(String)
    sub_sport = Column(String, nullable=True)
    file_created_time = Column(String, nullable=True)
    activity_type = Column(String)
    gps_quality_pct = Column(Float)
    gps_points_count = Column(Integer)
    min_elevation = Column(Float)
    max_elevation = Column(Float)
    avg_elevation = Column(Float)
    huami_secret_xxx168 = Column(Integer)
    
    # Store nested structure data directly in JSON
    hr_zones = Column(JSON)
    biomechanics = Column(JSON)
    peak_hr = Column(JSON)
    gps_path = Column(JSON)
    chart_series = Column(JSON)
    laps = Column(JSON)
    timeline_events = Column(JSON)
    developer_data = Column(JSON)
    developer_fields = Column(JSON)
    message_counts = Column(JSON)
    
    # Cache generated exports
    gpx_data = Column(Text, nullable=True)
    csv_data = Column(Text, nullable=True)

    def to_dict(self):
        """
        Convert to full JSON payload matching the React dashboard requirements.
        """
        # Format duration_str from duration_sec
        try:
            dur_str = str(datetime.timedelta(seconds=int(self.duration_sec)))
        except Exception:
            dur_str = "00:00:00"

        res = {
            "id": self.id,
            "metadata": {
                "device_name": self.device_name,
                "manufacturer": "Huami" if "Amazfit" in self.device_name else "Garmin",
                "software_creator": "run.227.huami.com" if "Amazfit" in self.device_name else "Garmin Connect",
                "start_time_local": self.start_time_local,
                "start_time_utc": self.start_time_utc.strftime('%H:%M:%SZ') if self.start_time_utc else "N/A",
                "timezone_offset_seconds": 0,
                "timezone_offset_hours": 0.0,
                "message_counts": self.message_counts,
                "developer_fields": self.developer_fields,
                "developer_data": self.developer_data,
                "sport": self.sport,
                "sub_sport": self.sub_sport,
                "file_created_time": self.file_created_time,
                "activity_type": self.activity_type,
                "huami_secret_xxx168": self.huami_secret_xxx168,
                "gps_quality_pct": self.gps_quality_pct,
                "gps_points_count": self.gps_points_count,
                "min_elevation": self.min_elevation,
                "max_elevation": self.max_elevation,
                "avg_elevation": self.avg_elevation,
            },
            "summary": {
                "distance_km": self.distance_km,
                "duration_sec": self.duration_sec,
                "duration_str": dur_str,
                "avg_speed_kmh": (self.distance_km / (self.duration_sec / 3600)) if self.duration_sec else 0.0,
                "avg_pace": self.avg_pace,
                "best_pace": self.best_pace,
                "ascent_m": self.ascent_m,
                "descent_m": self.descent_m,
                "avg_hr": self.avg_hr,
                "max_hr": self.max_hr,
                "min_hr": self.min_hr,
                "aerobic_te": self.aerobic_te,
                "anaerobic_te": self.anaerobic_te,
                "training_load": self.training_load,
                "calories": self.calories,
                "avg_cadence_spm": self.avg_cadence_spm,
                "max_cadence_spm": self.max_cadence_spm,
                "avg_step_len_mm": self.avg_step_len_mm,
                "estimated_steps": self.estimated_steps,
                "min_elevation": self.min_elevation,
                "max_elevation": self.max_elevation,
                "avg_elevation": self.avg_elevation,
            },
            "hr_zones": self.hr_zones,
            "biomechanics": self.biomechanics,
            "peak_hr": self.peak_hr,
            "gps_path": self.gps_path,
            "chart_series": self.chart_series,
            "laps": self.laps,
            "timeline_events": self.timeline_events,
            "gpx_data": self.gpx_data,
            "csv_data": self.csv_data
        }
        return sanitize_json_values(res)
