from cx_Freeze import setup, Executable

setup(
    name="SpeedTest",
    version="1.0",
    description="Speed Test App",
    executables=[Executable("app.py")]
)
