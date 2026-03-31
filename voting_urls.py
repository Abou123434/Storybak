from django.urls import path
from . import views

urlpatterns = [
    path('', views.vote_page, name='vote_page'),
    path('vote/<int:image_id>/', views.vote_image, name='vote_image'),
]
