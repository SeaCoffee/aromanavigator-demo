from __future__ import annotations

from django.urls import path

from .views import (
    ModObjectCoverListView,
    ModObjectPhotoListView,
    ObjectAttachmentsAddView,
    ObjectCoverDeleteView,
    ObjectCoverSetView,
    ObjectPhotosDetailView,
    ObjectPhotoDeleteView,
    PerfumePhotoBulkCreateView,
    PerfumePhotoCreateView,
    PerfumePhotoDeleteView,
    PrivateObjectPhotoFileView,
)

app_name = "photos"

urlpatterns = [
    # --- OBJECT PHOTOS / COVERS ---
    path("object/cover", ObjectCoverSetView.as_view(), name="object-cover-set"),
    path("object/cover/mod", ModObjectCoverListView.as_view(), name="mod-object-cover-list"),
    path("object/cover/<int:pk>/delete", ObjectCoverDeleteView.as_view(), name="object-cover-delete"),
    path("object/attachments", ObjectAttachmentsAddView.as_view(), name="object-attachments-add"),
    path("object/mod", ModObjectPhotoListView.as_view(), name="mod-object-photo-list"),
    path("object/<str:app_label>/<str:model>/<int:object_id>", ObjectPhotosDetailView.as_view(), name="object-photos-detail"),
    path("object/<int:pk>/delete", ObjectPhotoDeleteView.as_view(), name="object-photo-delete"),
    path("private/<int:pk>/file", PrivateObjectPhotoFileView.as_view(), name="private-object-photo-file"),

    # --- PERFUME PHOTOS ---
    path("<str:model>/<int:object_id>/bulk", PerfumePhotoBulkCreateView.as_view(), name="photo-bulk"),
    path("<str:model>/<int:object_id>/single", PerfumePhotoCreateView.as_view(), name="photo-create"),
    path("<int:pk>/delete", PerfumePhotoDeleteView.as_view(), name="photo-delete"),
]
