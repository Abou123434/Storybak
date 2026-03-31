from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import Image
from django.utils import timezone
from datetime import timedelta
import random

def vote_page(request):
    Image.objects.filter(uploaded_at__lt=timezone.now() - timedelta(hours=24)).delete()
    images = list(Image.objects.all())
    pair = []
    if len(images) >= 2:
        pair = random.sample(images, 2)
    return render(request, "voting/vote.html", {"pair": pair})

def vote_image(request, image_id):
    img = get_object_or_404(Image, id=image_id)
    img.votes += 1
    img.views += 1
    img.save()
    return JsonResponse({'votes': img.votes, 'views': img.views})
