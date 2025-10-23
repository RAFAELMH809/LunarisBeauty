import json
from decimal import Decimal
from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Product  # Importa tu modelo Product


def index_view(request):
    """
    Muestra la página de inicio con todos los productos.
    """
    # 1. Obtenemos todos los productos
    products = Product.objects.all()

    # 2. Obtenemos los IDs de los favoritos (si el usuario está logueado)
    favorited_product_ids = set()
    if request.user.is_authenticated:
        favorited_product_ids = set(
            request.user.favorite_products.values_list("id", flat=True)
        )
    # 3. Añadimos un atributo .is_favorited a CADA producto
    #    La plantilla ahora solo tiene que leer este valor simple.
    for product in products:
        product.is_favorited = product.id in favorited_product_ids

    context = {
        "products": products,  # ¡Pasamos la lista de objetos Product completos!
    }
    return render(request, "core/pages/index.html", context)


def register_view(request):
    """
    Maneja el registro de nuevos usuarios.
    """
    if request.method == "POST":
        # 1. Si los datos ya fueron enviados (POST)
        form = UserCreationForm(request.POST)

        if form.is_valid():
            # 2. Si el formulario es válido, guardamos al usuario
            user = form.save()
            # 3. (Opcional pero recomendado) Iniciamos sesión automáticamente
            login(request, user)
            # 4. Redirigimos a la página principal
            return redirect("index")
    else:
        # 5. Si es la primera vez que se carga (GET), mostramos un formulario vacío
        form = UserCreationForm()

    # 6. Renderizamos la plantilla con el formulario
    context = {"form": form}
    return render(request, "core/pages/register.html", context)


@login_required  # 1. Protege la vista
def favorites_view(request):
    """
    Muestra la lista de productos favoritos del usuario actual.
    """
    # 2. Accedemos al usuario logueado
    user = request.user

    # 3. Obtenemos sus productos favoritos
    #    Usamos 'favorite_products', el 'related_name' que definimos
    #    en el modelo Product.
    products = user.favorite_products.all()

    # 4. Pasamos los productos a la plantilla
    context = {"products": products}

    # Renderizamos la nueva plantilla que vamos a crear
    return render(request, "core/pages/favorites.html", context)


@login_required  # 1. Asegura que el usuario esté logueado
@require_POST  # 2. Asegura que esta vista solo acepte peticiones POST
def toggle_favorite_view(request, product_id):
    """
    Añade o quita un producto de la lista de favoritos de un usuario.
    """
    try:
        # 3. Busca el producto por su ID
        product = Product.objects.get(id=product_id)
        user = request.user

        # 4. Revisa si el usuario ya tiene este producto en favoritos
        if user in product.favorited_by.all():
            # Si SÍ lo tiene, lo quitamos
            product.favorited_by.remove(user)
            is_favorited = False
        else:
            # Si NO lo tiene, lo añadimos
            product.favorited_by.add(user)
            is_favorited = True

        # 5. Devuelve una respuesta JSON
        return JsonResponse({"status": "ok", "is_favorited": is_favorited})

    except Product.DoesNotExist:
        return JsonResponse(
            {"status": "error", "message": "Producto no encontrado"}, status=404
        )
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@login_required
def payment_view(request):
    """
    Muestra la página de pago con el resumen del carrito.
    """
    cart_items = []
    total_price = Decimal("0.00")

    # 1. Esta vista SÓLO debe funcionar si recibe un POST con datos
    if request.method == "POST":
        # 2. Obtenemos el string JSON del formulario oculto
        cart_data_json = request.POST.get("cart_data")

        if cart_data_json:
            try:
                # 3. Convertimos el JSON (string) en una lista de Python
                cart_data = json.loads(cart_data_json)

                # Para más seguridad, obtenemos los IDs
                product_ids = [item["id"] for item in cart_data]
                # Obtenemos los productos de la BD
                products_in_db = Product.objects.filter(id__in=product_ids)
                products_map = {str(p.id): p for p in products_in_db}

                # 4. Procesamos el carrito
                for item in cart_data:
                    product = products_map.get(str(item.get("id")))

                    if product:
                        quantity = int(item.get("qty", 1))
                        # ¡Importante! Usamos el precio de la BD, no el del JS
                        price = product.price
                        subtotal = price * quantity

                        cart_items.append(
                            {
                                "product": product,
                                "size": item.get("size", "-"),
                                "quantity": quantity,
                                "subtotal": subtotal,
                            }
                        )
                        total_price += subtotal

            except json.JSONDecodeError:
                # Manejar el error si el JSON es inválido
                pass

                # 5. Si no hay items (o no es POST), redirigimos al inicio
    if not cart_items:
        return redirect("index")

    context = {"cart_items": cart_items, "total_price": total_price}

    return render(request, "core/pages/payment.html", context)
