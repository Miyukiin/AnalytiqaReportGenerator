from django.db import models

# Create your models here.

class Visitors(models.Model):
    uuid = models.UUIDField(max_length= 36, 
                            primary_key=True, 
                            unique=True, 
                            blank=False, 
                            null=False, 
                            verbose_name="Universally Unique Identifier"),
    
    orig_csv_file = models.FileField(upload_to='visitors/csv_files/original',
                                verbose_name="Original CSV FILE", 
                                unique=False,
                                blank=False,
                                )
    
    clean_csv_file = models.FileField(upload_to='visitors/csv_files/clean',
                                verbose_name="Cleaned CSV FILE", 
                                unique=False,
                                blank=False,
                                )
    
    updated_at = models.DateTimeField(auto_now=True)
    