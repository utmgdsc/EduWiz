import uvicorn


if __name__ == "__main__":
    uvicorn.run("server:app", port=8080, reload=True, host="0.0.0.0", log_level="debug")
