import traceback
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from app.utils.logger import logger

class GlobalExceptionHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            return await call_next(request)
        except Exception as e:
            # Log the full traceback
            logger.error(f"Unhandled Exception: {str(e)}")
            logger.error(traceback.format_exc())
            
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "detail": "An internal server error occurred. Our team has been notified.",
                    "error_type": e.__class__.__name__
                }
            )

def setup_error_handler(app: FastAPI):
    app.add_middleware(GlobalExceptionHandlerMiddleware)

    # Specific handler for validation errors
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(f"Validation Error on {request.url.path}: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": "Invalid input parameters",
                "errors": exc.errors()
            }
        )
