from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from django.contrib import admin


urlpatterns = [

   path("django-admin/", admin.site.urls),

   path('userApi/auth/', include('apps.auth.urls')),
   path('userApi/users/', include('apps.users.urls')),
   path('userApi/core/', include('core.urls')),

   path("userApi/social/", include("apps.social.urls")),
   path("userApi/notifications/", include("apps.notifications.urls")),
   path("userApi/wardrobe/", include("apps.wardrobe.urls")),
   path("userApi/taste-profile/", include("apps.taste_profile.urls")),
   path("userApi/activity/", include("apps.activity.urls")),
   path('userApi/favorites/', include('apps.favorites.urls')),

   path("userApi/articles/", include("apps.articles.urls")),

   path("userApi/photos/", include("apps.photos.urls")),

   path("userApi/exchange/", include("apps.exchange.urls")),

   path("userApi/fragrance/", include("apps.fragrance.urls")),
   path("userApi/fragrance/", include("apps.fragrance.urls_official")),
   path("userApi/fragrance_ugc/", include("apps.fragrance_ugc.urls")),

   path("userApi/forum/", include("apps.forum.urls")),
   path("userApi/likes/", include("apps.likes.urls")),
   path("userApi/tags/", include("apps.tags.urls")),
   path("userApi/comments/", include("apps.comments.urls")),

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.PUBLIC_MEDIA_ROOT)
