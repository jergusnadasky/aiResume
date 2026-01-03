from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI


def setup_cors(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            # later:
            # "https://airesume.io"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
