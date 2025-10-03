import streamlit as st
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sqlalchemy import create_engine, text
import datetime
import matplotlib.patches as patches

# --- Database Credentials & Connection ---
PG_HOST = 'aws-0-ap-south-1.pooler.supabase.com'
PG_USER = 'postgres.avqpzwgdylnklbkyqukp'
PG_PASSWORD = 'asBjLmDfKfoZPVt9'
PG_DB = 'postgres'

# Create PostgreSQL connection
engine = create_engine(f"postgresql+psycopg2://{PG_USER}:{PG_PASSWORD}@{PG_HOST}/{PG_DB}?sslmode=require")

# --- Streamlit Page Setup ---
st.set_page_config(page_title="Attendance Dashboard", layout="wide")
st.title("📊 Attendance Dashboard")

# --- Sidebar & Data Loading ---
with st.sidebar:
    st.header("🔍 Filters")

    # 1. Fetch overall date boundaries from the database.
    # This is cached to avoid re-querying on every interaction.
    @st.cache_data
    def get_date_boundaries():
        query = "SELECT MIN(date), MAX(date) FROM attendance;"
        try:
            with engine.connect() as conn:
                result = conn.execute(text(query)).fetchone()
            # Ensure dates are converted to pandas Timestamps
            min_date = pd.to_datetime(result[0]) if result and result[0] else pd.to_datetime(datetime.date.today())
            max_date = pd.to_datetime(result[1]) if result and result[1] else pd.to_datetime(datetime.date.today())
            return min_date, max_date
        except Exception as e:
            st.error(f"Failed to connect to DB: {e}")
            return pd.to_datetime(datetime.date.today()), pd.to_datetime(datetime.date.today())

    min_db_date, max_db_date = get_date_boundaries()

    # 2. Compute default 30-day window for the date input.
    default_start = max_db_date - pd.Timedelta(days=29)
    default_end = max_db_date

    # 3. Create the date input widget with the new defaults.
    date_range = st.date_input(
        "📅 Date Range",
        value=[default_start.date(), default_end.date()],
        min_value=min_db_date.date(),
        max_value=max_db_date.date()
    )

    # 4. Load data from the database ONLY for the selected date range.
    # This is the core performance improvement.
    if len(date_range) == 2:
        start_date, end_date = date_range
        # Use parameterized query to prevent SQL injection
        query = text("SELECT * FROM attendance WHERE date BETWEEN :start AND :end;")
        df = pd.read_sql(query, engine, params={'start': start_date, 'end': end_date})
    else:
        # If no valid date range, create an empty dataframe to avoid errors.
        df = pd.DataFrame()

    # 5. Pre-process the loaded data.
    if not df.empty:
        df["date"] = pd.to_datetime(df["date"])
        df["day"] = df["date"].dt.day_name()
    else:
        # Define columns for the empty DataFrame to prevent errors in filters
        df = pd.DataFrame(columns=[
            'date', 'day', 'department', 'class', 'teacher_name', 'subject',
            'lecture_time', 'name', 'attendance'
        ])

    # --- Interdependent Filters ---

    # Function to get filtered dataframe based on current selections
    def get_filtered_df(exclude_filter=None):
        temp_df = df.copy()
        if exclude_filter != 'department' and 'department' in st.session_state and st.session_state.department:
            temp_df = temp_df[temp_df["department"].isin(st.session_state.department)]
        if exclude_filter != 'class' and 'class' in st.session_state and st.session_state['class']:
            temp_df = temp_df[temp_df["class"].isin(st.session_state['class'])]
        if exclude_filter != 'teacher' and 'teacher' in st.session_state and st.session_state.teacher:
            temp_df = temp_df[temp_df["teacher_name"].isin(st.session_state.teacher)]
        if exclude_filter != 'subject' and 'subject' in st.session_state and st.session_state.subject:
            temp_df = temp_df[temp_df["subject"].isin(st.session_state.subject)]
        if exclude_filter != 'lecture_time' and 'lecture_time' in st.session_state and st.session_state.lecture_time:
            temp_df = temp_df[temp_df["lecture_time"].isin(st.session_state.lecture_time)]
        if exclude_filter != 'day' and 'day' in st.session_state and st.session_state.day:
            temp_df = temp_df[temp_df["day"].isin(st.session_state.day)]
        if exclude_filter != 'student' and 'student' in st.session_state and st.session_state.student:
            temp_df = temp_df[temp_df["name"].isin(st.session_state.student)]
        return temp_df

    # All subsequent filters operate on the already date-filtered dataframe 'df'
    available_depts = sorted(get_filtered_df('department')["department"].unique())
    dept = st.multiselect("🏢 Department", available_depts, key='department')

    available_classes = sorted(get_filtered_df('class')["class"].unique())
    cls = st.multiselect("🎓 Class", available_classes, key='class')

    available_teachers = sorted(get_filtered_df('teacher')["teacher_name"].unique())
    teacher = st.multiselect("👨‍🏫 Teacher", available_teachers, key='teacher')

    available_subjects = sorted(get_filtered_df('subject')["subject"].unique())
    subject = st.multiselect("📚 Subject", available_subjects, key='subject')

    lecture_order = ["09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-01:00", "01:30-02:30", "02:30-03:30"]
    available_times = get_filtered_df('lecture_time')["lecture_time"].dropna().str.strip().unique()
    ordered_lecture_times = [time for time in lecture_order if time in available_times]
    lecture_time = st.multiselect("🕒 Lecture Time", ordered_lecture_times, key='lecture_time')

    weekday_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    available_days = get_filtered_df('day')["day"].dropna().unique()
    ordered_days = [d for d in weekday_order if d in available_days]
    day = st.multiselect("📅 Day", ordered_days, key='day')

    available_students = sorted(get_filtered_df('student')["name"].unique())
    student = st.multiselect("👨‍🎓 Student Name", available_students, key='student')

    # Get final filtered dataset
    final_df = get_filtered_df()

    # --- Filter Summary ---
    st.markdown("---")
    st.markdown("**Filter Summary:**")
    st.write(f"📊 Records: {len(final_df):,}")
    if len(date_range) == 2:
        st.write(f"📅 Date: {date_range[0].strftime('%b %d, %Y')} to {date_range[1].strftime('%b %d, %Y')}")
    if dept: st.write(f"🏢 Departments: {', '.join(dept)}")
    if cls: st.write(f"🎓 Classes: {', '.join(cls)}")
    if teacher: st.write(f"👨‍🏫 Teachers: {len(teacher)} selected")
    if subject: st.write(f"📚 Subjects: {len(subject)} selected")
    if lecture_time: st.write(f"🕒 Time Slots: {', '.join(lecture_time)}")
    if day: st.write(f"📅 Days: {', '.join(day)}")
    if student: st.write(f"👨‍🎓 Students: {len(student)} selected")

    # Clear all filters button
    if st.button("🗑️ Clear All Filters"):
        keys_to_clear = ['department', 'class', 'teacher', 'subject', 'lecture_time', 'day', 'student']
        for key in keys_to_clear:
            if key in st.session_state:
                st.session_state[key] = []
        st.rerun()

# --- Main Dashboard Display ---

# Use the final filtered dataframe for all calculations and visuals
df = final_df

if df.empty:
    st.error("⚠️ No data matches your current filter combination. Please adjust your selection in the sidebar.")
    st.stop() # Stop execution if no data is available

st.info(f"📊 Showing data for **{len(df):,}** records based on your filter selection.")

# --- KPIs & Visualizations ---

# Calculate attendance metric
total = len(df)
present = len(df[df["attendance"].str.upper() == "P"])
attendance_pct_val = round((present / total) * 100, 2) if total > 0 else 0

# 🎯 Modern Circular Arc Gauges - Present vs Absent
st.subheader("🎯 Attendance Overview")
absent_pct_val = 100 - attendance_pct_val
col_gauge1, col_gauge2 = st.columns(2)

def create_gauge(percentage, title, main_color, bg_color='#2E2E2E'):
    fig, ax = plt.subplots(figsize=(8, 8), facecolor='#0E1117')
    ax.set_facecolor('#0E1117')
    center, radius, start_angle, end_angle = (0.5, 0.5), 0.3, 200, -20
    total_angle = start_angle - end_angle
    ax.add_patch(patches.Wedge(center, radius + 0.08, end_angle, start_angle, width=0.16, facecolor=bg_color, alpha=0.3))
    if percentage > 0:
        filled_angle_span = (percentage / 100) * total_angle
        ax.add_patch(patches.Wedge(center, radius + 0.08, start_angle - filled_angle_span, start_angle, width=0.16, facecolor=main_color, alpha=0.9))
    needle_angle = start_angle - (percentage / 100) * total_angle
    needle_x, needle_y = center[0] + (radius - 0.02) * np.cos(np.radians(needle_angle)), center[1] + (radius - 0.02) * np.sin(np.radians(needle_angle))
    ax.plot([center[0], needle_x], [center[1], needle_y], color='white', linewidth=3, solid_capstyle='round')
    ax.add_patch(patches.Circle(center, 0.02, color='white', zorder=10))
    ax.text(center[0], center[1] - 0.08, f"{percentage:.1f}%", ha='center', va='center', fontsize=32, fontweight='bold', color='white')
    ax.text(center[0], center[1] - 0.15, title, ha='center', va='center', fontsize=12, fontweight='bold', color='#888888')
    for val in [0, 50, 100]:
        angle = start_angle - (val / 100) * total_angle
        x1, y1 = center[0] + (radius + 0.1) * np.cos(np.radians(angle)), center[1] + (radius + 0.1) * np.sin(np.radians(angle))
        x2, y2 = center[0] + (radius + 0.14) * np.cos(np.radians(angle)), center[1] + (radius + 0.14) * np.sin(np.radians(angle))
        ax.plot([x1, x2], [y1, y2], color='white', linewidth=1.5)
        x_text, y_text = center[0] + (radius + 0.17) * np.cos(np.radians(angle)), center[1] + (radius + 0.17) * np.sin(np.radians(angle))
        ax.text(x_text, y_text, f"{val}", ha='center', va='center', fontsize=10, fontweight='bold', color='white')
    if title == "P R E S E N T":
        status, status_color = ("EXCELLENT", "#00FF7F") if percentage >= 80 else ("GOOD", "#FFD700") if percentage >= 60 else ("LOW", "#FF6347")
    else:
        status, status_color = ("EXCELLENT", "#00FF7F") if percentage <= 20 else ("ACCEPTABLE", "#FFD700") if percentage <= 40 else ("HIGH", "#FF6347")
    ax.text(center[0], 0.15, status, ha='center', va='center', fontsize=11, fontweight='bold', color=status_color, bbox=dict(boxstyle="round,pad=0.2", facecolor=status_color, alpha=0.2))
    ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis('off'); plt.tight_layout()
    return fig

with col_gauge1:
    st.pyplot(create_gauge(attendance_pct_val, "P R E S E N T", "#00FF7F"))
with col_gauge2:
    st.pyplot(create_gauge(absent_pct_val, "A B S E N T", "#FF6347"))

# --- CHARTS AND TABLES ---
sns.set_theme(style="whitegrid")
color_palette = sns.color_palette("Set2") + sns.color_palette("Set3")

# 📈 Absentee % by Student - Dept & Class
st.subheader("📈 Absentee % by Student (Grouped by Department & Class)")
col1, col2 = st.columns(2)
df["is_absent"] = df["attendance"].str.upper() == "A"

with col1:
    dept_trend = df.groupby(["name", "department"]).agg(absent=('is_absent', 'sum'), total=('attendance', 'count')).reset_index()
    if not dept_trend.empty and dept_trend['total'].sum() > 0:
        dept_trend["absent_pct"] = (dept_trend["absent"] / dept_trend["total"] * 100).round(2)
        fig1, ax1 = plt.subplots(figsize=(10, 5))
        sns.lineplot(data=dept_trend.sort_values("absent_pct", ascending=False), x="name", y="absent_pct", hue="department", marker="o", ax=ax1)
        for dept_name in dept_trend["department"].unique():
            subset = dept_trend[dept_trend["department"] == dept_name].sort_values("name")
            ax1.fill_between(subset["name"], 0, subset["absent_pct"], alpha=0.3)
        ax1.set_xlabel("Student Name"); ax1.set_ylabel("Absent %"); ax1.set_yticks(np.arange(0, 101, 10))
        ax1.set_yticklabels([f"{i}%" for i in range(0, 101, 10)]); ax1.set_ylim(0, 100)
        ax1.set_title("Absent % by Student (Grouped by Department)"); ax1.tick_params(axis='x', rotation=45)
        st.pyplot(fig1)
    else: st.info("No data available for department-wise absentee chart.")

with col2:
    class_trend = df.groupby(["name", "class"]).agg(absent=('is_absent', 'sum'), total=('attendance', 'count')).reset_index()
    if not class_trend.empty and class_trend['total'].sum() > 0:
        class_trend["absent_pct"] = (class_trend["absent"] / class_trend["total"] * 100).round(2)
        fig2, ax2 = plt.subplots(figsize=(10, 5))
        sns.lineplot(data=class_trend.sort_values("absent_pct", ascending=False), x="name", y="absent_pct", hue="class", marker="o", ax=ax2)
        for cls_name in class_trend["class"].unique():
            subset = class_trend[class_trend["class"] == cls_name].sort_values("name")
            ax2.fill_between(subset["name"], 0, subset["absent_pct"], alpha=0.3)
        ax2.set_xlabel("Student Name"); ax2.set_ylabel("Absent %"); ax2.set_yticks(np.arange(0, 101, 10))
        ax2.set_yticklabels([f"{i}%" for i in range(0, 101, 10)]); ax2.set_ylim(0, 100)
        ax2.set_title("Absent % by Student (Grouped by Class)"); ax2.tick_params(axis='x', rotation=45)
        st.pyplot(fig2)
    else: st.info("No data available for class-wise absentee chart.")

# 📊 Donut Charts for Attendance
col3, col4 = st.columns(2)
with col3:
    class_counts = df[df["attendance"].str.upper() == "P"]["class"].value_counts()
    if not class_counts.empty:
        fig3, ax3 = plt.subplots(figsize=(10, 5))
        wedges, texts, autotexts = ax3.pie(class_counts, labels=class_counts.index, autopct='%1.1f%%', startangle=90, colors=color_palette[:len(class_counts)], pctdistance=0.75, textprops={'fontsize': 12, 'weight': 'bold'}, wedgeprops=dict(width=0.4, edgecolor='w', linewidth=1.2), shadow=True)
        ax3.text(0, 0, 'Class\nAttendance', ha='center', va='center', fontsize=14, weight='bold', color='gray')
        ax3.set_title("🎓 Attendance % by Class", fontsize=16, weight='bold'); ax3.axis('equal'); st.pyplot(fig3)
    else: st.info("No attendance data for class-wise pie chart.")
with col4:
    time_counts = df[df["attendance"].str.upper() == "P"]["lecture_time"].value_counts().reindex(lecture_order).dropna()
    if not time_counts.empty:
        fig4, ax4 = plt.subplots(figsize=(10, 5))
        wedges, texts, autotexts = ax4.pie(time_counts, labels=time_counts.index, autopct='%1.1f%%', startangle=90, colors=color_palette[:len(time_counts)], pctdistance=0.75, textprops={'fontsize': 12, 'weight': 'bold'}, wedgeprops=dict(width=0.4, edgecolor='w', linewidth=1.2), shadow=True)
        ax4.text(0, 0, 'Lecture\nTime', ha='center', va='center', fontsize=14, weight='bold', color='gray')
        ax4.set_title("🕒 Attendance % by Lecture Time", fontsize=16, weight='bold'); ax4.axis('equal'); st.pyplot(fig4)
    else: st.info("No attendance data for lecture time pie chart.")

# 📅 Attendance % by Day
col5, col6 = st.columns(2)
with col5:
    pct_df_class = df.groupby(["day", "class"]).agg(total=('attendance', 'count'), present=('attendance', lambda x: (x.str.upper() == 'P').sum())).reset_index()
    if not pct_df_class.empty and pct_df_class['total'].sum() > 0:
        pct_df_class["attendance_pct"] = ((pct_df_class["present"] / pct_df_class["total"]) * 100).round(2)
        fig5, ax5 = plt.subplots(figsize=(8, 4))
        sns.barplot(data=pct_df_class, x="day", y="attendance_pct", hue="class", ax=ax5, order=weekday_order)
        ax5.set_title("Attendance % by Day and Class"); ax5.set_ylim(0, 100); st.pyplot(fig5)
    else: st.info("No data for day/class attendance chart.")
with col6:
    pct_df_dept = df.groupby(["day", "department"]).agg(total=('attendance', 'count'), present=('attendance', lambda x: (x.str.upper() == 'P').sum())).reset_index()
    if not pct_df_dept.empty and pct_df_dept['total'].sum() > 0:
        pct_df_dept["attendance_pct"] = ((pct_df_dept["present"] / pct_df_dept["total"]) * 100).round(2)
        fig6, ax6 = plt.subplots(figsize=(8, 4))
        sns.barplot(data=pct_df_dept, x="day", y="attendance_pct", hue="department", ax=ax6, order=weekday_order)
        ax6.set_title("Attendance % by Day and Department"); ax6.set_ylim(0, 100); st.pyplot(fig6)
    else: st.info("No data for day/department attendance chart.")

# 🚨 Top 10 Defaulters
st.subheader("🚨 Top 10 Defaulters (Overall)")
summary = df.groupby(["name", "department", "class"]).agg(total_attendance=('attendance', 'count'), total_absent=('is_absent', 'sum')).reset_index()
if not summary.empty and summary['total_attendance'].sum() > 0:
    summary["absent_pct"] = round((summary["total_absent"] / summary["total_attendance"]) * 100, 2)
    summary = summary.sort_values("absent_pct", ascending=False).head(10)
    summary = summary.rename(columns={"name": "Name", "department": "Department", "class": "Class", "total_attendance": "Total Attendance", "total_absent": "Absent", "absent_pct": "Absent %"})
    def format_defaulter_arrow(val):
        arrow = "🔺" if val > 50 else "🔻"
        color = "red" if val > 80 else "orange" if val > 50 else "green"
        return f'<span style="color:{color}; font-weight:bold">{arrow} {val:.2f}%</span>'
    summary["Absent %"] = summary["Absent %"].apply(format_defaulter_arrow)
    styled_html = summary.to_html(escape=False, index=False, justify="center", border=0)
    custom_css = """<style>table{width:100%;border-collapse:collapse;font-family:Arial}thead{background-color:#7D1935;color:white;font-weight:bold}td,th{text-align:center;padding:8px;border:1px solid #ddd}tbody tr:nth-child(even){background-color:#f5f5f5;color:black}tbody tr:nth-child(odd){background-color:#ffffff;color:black}</style>"""
    st.markdown(custom_css + styled_html, unsafe_allow_html=True)
else:
    st.info("No defaulter data available with current filters.")

# 📋 Absence % Table
st.subheader("📋 Detailed Absence % Table")
df["formatted_date"] = df["date"].dt.strftime("%d %b %y")
pivot_total = df.pivot_table(index=["name", "department", "class"], columns="formatted_date", values="attendance", aggfunc="count").fillna(0)
pivot_absent = df[df["attendance"].str.upper() == "A"].pivot_table(index=["name", "department", "class"], columns="formatted_date", values="attendance", aggfunc="count").fillna(0)
if not pivot_total.empty and not pivot_absent.empty:
    # Reindex to ensure both pivots have the same shape before division
    pivot_absent = pivot_absent.reindex_like(pivot_total).fillna(0)
    absence_pct = (pivot_absent / pivot_total * 100).fillna(0).round(2).astype(str) + "%"
    absence_pct = absence_pct.reset_index()
    st.dataframe(absence_pct, use_container_width=True)
else:
    st.info("No detailed absence data available with current filters.")
