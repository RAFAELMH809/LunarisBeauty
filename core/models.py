from django.db import models

# Importamos el modelo User de Django para poder relacionarlo
from django.contrib.auth.models import User


class Product(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nombre")
    subtitle = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="Subtítulo"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    image = models.ImageField(upload_to="products/", verbose_name="Imagen")

    # --- CAMPOS NUEVOS ---
    # Usamos TextField para descripciones largas
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")

    # Para listas (como beneficios), un TextField simple funciona.
    # El usuario puede escribir "Beneficio 1|Beneficio 2"
    benefits = models.TextField(
        blank=True, null=True, verbose_name="Beneficios (separados por |)"
    )
    ingredients = models.TextField(blank=True, null=True, verbose_name="Ingredientes")
    how_to_use = models.TextField(blank=True, null=True, verbose_name="Modo de empleo")
    warnings = models.TextField(blank=True, null=True, verbose_name="Precauciones")

    # (Campo de favoritos existente)
    favorited_by = models.ManyToManyField(
        User, related_name="favorite_products", blank=True, verbose_name="Favorito de"
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
