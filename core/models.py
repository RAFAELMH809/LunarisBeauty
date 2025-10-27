# core/models.py
from django.db import models
from django.contrib.auth.models import User


class Product(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nombre")
    subtitle = models.CharField(max_length=255, blank=True, null=True, verbose_name="Subtítulo")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    benefits = models.TextField(blank=True, null=True, verbose_name="Beneficios (separados por |)")
    ingredients = models.TextField(blank=True, null=True, verbose_name="Ingredientes")
    how_to_use = models.TextField(blank=True, null=True, verbose_name="Modo de empleo")
    warnings = models.TextField(blank=True, null=True, verbose_name="Precauciones")
    image = models.ImageField(upload_to="products/", verbose_name="Imagen")

    favorited_by = models.ManyToManyField(
        User, related_name="favorite_products", blank=True, verbose_name="Favorito de"
    )

    def __str__(self):
        return self.name
    
    @property
    def first_price(self):
      first = self.sizes.first()
      return first.price if first else 0


    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"


# === NUEVO MODELO ===
class ProductSize(models.Model):
    SIZE_CHOICES = [
        ('chico', 'Chico'),
        ('mediano', 'Mediano'),
        ('grande', 'Grande'),
    ]

    product = models.ForeignKey(
        Product, related_name="sizes", on_delete=models.CASCADE, verbose_name="Producto"
    )
    size = models.CharField(max_length=10, choices=SIZE_CHOICES, verbose_name="Tamaño")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")

    def __str__(self):
        return f"{self.product.name} - {self.get_size_display()} (${self.price})"

    class Meta:
        verbose_name = "Tamaño de producto"
        verbose_name_plural = "Tamaños de productos"
        unique_together = ("product", "size")
