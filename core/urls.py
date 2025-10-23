# En: core/urls.py

from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path("", views.index_view, name="index"),
    # URL de favoritos
    path("favorites/", views.favorites_view, name="favorites"),
    # Esta URL capturará el ID del producto
    path(
        "toggle-favorite/<int:product_id>/",
        views.toggle_favorite_view,
        name="toggle-favorite",
    ),
    # URL de pago
    path("payment/", views.payment_view, name="payment"),
    # URL de Registro
    path("register/", views.register_view, name="register"),
    # URL de Login
    path(
        "login/",
        auth_views.LoginView.as_view(template_name="core/pages/login.html"),
        name="login",
    ),
    # URL de Logout
    path("logout/", auth_views.LogoutView.as_view(next_page="index"), name="logout"),
]
