import logging
import sys
from app.config.settings import settings

def setup_logger(name: str = "mindcare_logger") -> logging.Logger:
    logger = logging.getLogger(name)
    
    # If logger already has handlers, don't add more (prevents duplicate logs)
    if logger.handlers:
        return logger

    logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    
    # Formatter
    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
    )
    
    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger

# Shared logger instance
logger = setup_logger()
