from django.db import models

# Create your models here.

class Visitors(models.Model):
    uuid = models.CharField(max_length= 36, 
                            primary_key=True, 
                            unique=True, 
                            blank=False, 
                            null=False, 
                            verbose_name="Universally Unique Identifier")
    