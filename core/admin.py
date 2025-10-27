# core/admin.py
from django.contrib import admin
from .models import Product, ProductSize


# --- Inline para añadir tamaños dentro del producto ---
class ProductSizeInline(admin.TabularInline):  # o admin.StackedInline si prefieres estilo de bloques
    model = ProductSize
    extra = 1  # cuántas filas vacías se muestran para añadir tamaños nuevos


# --- Admin del modelo Product ---
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "get_available_sizes")  # antes tenías ("name", "price")
    search_fields = ("name", "subtitle")
    filter_horizontal = ("favorited_by",)
    inlines = [ProductSizeInline]  # 👈 permite editar los tamaños dentro del producto

    # Mostrar los tamaños disponibles como texto en la lista
    def get_available_sizes(self, obj):
        sizes = obj.sizes.all().values_list("size", flat=True)
        if sizes:
            return ", ".join(sizes)
        return "Sin tamaños"
    get_available_sizes.short_description = "Tamaños disponibles"


# --- Admin independiente para ProductSize (opcional, por si quieres verlo aparte) ---
@admin.register(ProductSize)
class ProductSizeAdmin(admin.ModelAdmin):
    list_display = ("product", "size", "price")
    list_filter = ("size",)
    search_fields = ("product__name",)
