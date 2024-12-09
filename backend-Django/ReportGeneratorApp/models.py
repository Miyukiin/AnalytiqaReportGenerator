from django.db import models

# Create your models here.

class Visitors(models.Model):
    uuid = models.UUIDField(
                            max_length= 36, 
                            primary_key=True, 
                            unique=True, 
                            blank=False, 
                            null=False, 
                            verbose_name="Universally Unique Identifier"
                            )

    file_name = models.CharField(
                            max_length=50 ,
                            verbose_name="CSV File Name",
                            unique=False, 
                            blank=False, 
                            null=False, 
                            )
    
    orig_csv_file = models.FileField(
                            upload_to='visitors/csv_files/original',
                            verbose_name="Original CSV FILE", 
                            unique=False,
                            blank=False,
                            null=True
                            )
    
    clean_csv_file = models.FileField(
                            upload_to='visitors/csv_files/clean',
                            verbose_name="Cleaned CSV FILE", 
                            unique=False,
                            blank=True,
                            null=True
                            )
    
    updated_at = models.DateTimeField(
                            auto_now=True
                            )
    def __str__(self):
        return f"Visitor {self.uuid} - {self.file_name}"

    class Meta:
        verbose_name = "Visitor"
        verbose_name_plural = "Visitors"
        ordering = ['-updated_at']  # Newest first
    