from django.contrib import admin
from .models import Product  # Importa tu nuevo modelo


# Registra el modelo 'Product' en el sitio de administración
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "price")  # Columnas que se verán en la lista
    search_fields = ("name", "subtitle")  # Añade una barra de búsqueda
    # Filtro para ver qué usuarios le dieron favorito
    filter_horizontal = ("favorited_by",)
