from django.db import models
from django.utils import timezone

class Image(models.Model):
    image_file = models.ImageField(upload_to='images/')
    votes = models.IntegerField(default=0)
    views = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id} - Votes: {self.votes}"
