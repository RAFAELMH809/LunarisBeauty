import os
import dj_database_url
from pathlib import Path
import cloudinary
import cloudinary.uploader
import cloudinary.api
import dotenv
load_dotenv()
# ==============================
# BASE DIR
# ==============================
BASE_DIR = Path(__file__).resolve().parent.parent

# ==============================
# SEGURIDAD
# ==============================
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "django-insecure-$)i29!mkvrro9z0v=g6%!7jxv%@ep9k71yc#ms78a(7qnsuu5(",
)

DEBUG = os.getenv("DEBUG", "False").lower() == "true"

ALLOWED_HOSTS = ["localhost", "127.0.0.1", ".onrender.com"]

# ==============================
# APLICACIONES
# ==============================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "core",
    "cloudinary",
    "cloudinary_storage",
]

# ==============================
# MIDDLEWARE
# ==============================
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")

# ==============================
# TEMPLATES
# ==============================
ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ==============================
# BASE DE DATOS
# ==============================
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        ssl_require=False,
    )
}

# ==============================
# VALIDACIÓN DE CONTRASEÑAS
# ==============================
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ==============================
# INTERNACIONALIZACIÓN
# ==============================
LANGUAGE_CODE = "es-mx"
TIME_ZONE = "America/Mexico_City"
USE_I18N = True
USE_TZ = True

# ==============================
# ARCHIVOS ESTÁTICOS Y MEDIA
# ==============================
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ==============================
# CLOUDINARY CONFIG
# ==============================
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

# ==============================
# LOGIN
# ==============================
LOGIN_REDIRECT_URL = "index"
LOGIN_URL = "login"

# ==============================
# AUTO FIELD
# ==============================
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ==============================
# DEBUG LOG (solo local)
# ==============================
if not DEBUG:
    DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
    MEDIA_URL = f"https://res.cloudinary.com/{os.getenv('CLOUDINARY_CLOUD_NAME')}/"
    MEDIA_ROOT = None

if DEBUG:
    print(f"🔧 DEBUG MODE ON — DB: {DATABASES['default']}")
    print(f"☁️  Cloudinary: {os.getenv('CLOUDINARY_CLOUD_NAME')}")
