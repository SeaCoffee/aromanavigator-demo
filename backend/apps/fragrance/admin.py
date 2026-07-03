from django.contrib import admin
from .models import FragranceModel


@admin.register(FragranceModel)
class FragranceAdmin(admin.ModelAdmin):
    search_fields = ("name", "brand__name", "slug")
