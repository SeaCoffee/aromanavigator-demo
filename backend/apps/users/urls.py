from django.urls import path
from apps.users.views import UserCreateView, BlockUserView, \
    UnBlockUserView, UserToAdminView, UserPublicListView, UserRetrieveView, UserFilteredListView, \
    UpdateSelfView, DeleteSelfView, UserToModeratorView, ChangePasswordView, PasswordSetupView, AdminSuspendUserView,\
    AdminUnsuspendUserView, MeSuspendedView, MeView, PublicUserSearchView, PublicUserByDisplayNameView, \
    UserAdminListView, UserToUserView
from .presence import presence_heartbeat, presence_bulk


urlpatterns = [

    path("me", MeView.as_view(), name="users-me"), #y
    path("me/update", UpdateSelfView.as_view(), name="user_update_self"), #y
    path("me/delete", DeleteSelfView.as_view(), name="user_delete_self"), #y
    path("me/change_password", ChangePasswordView.as_view(), name="user_change_password"), #y
    path("me/password/setup", PasswordSetupView.as_view(), name="user_password_setup"),
    path('search', PublicUserSearchView.as_view(), name='users_search'), #y

    path("u/<str:username>", PublicUserByDisplayNameView.as_view(), name="users-by-display-name"),  # y

    path("me/suspended", MeSuspendedView.as_view(), name="users-me-suspended"),

    path("presence/heartbeat", presence_heartbeat, name="presence-heartbeat"), #y
    path("presence", presence_bulk, name="presence-bulk"), #y

    # Р РµРіРёСЃС‚СЂР°С†РёСЏ Рё РїСЂРѕСЃРјРѕС‚СЂ
    path('register', UserCreateView.as_view(), name='user_create'), #y
    path('list', UserPublicListView.as_view(), name='users_public_list'), #y

    # РњРѕРґРµСЂР°С†РёСЏ

    path('by/<str:lookup_value>', UserRetrieveView.as_view(), name='user_detail'),
    path('filtered', UserFilteredListView.as_view(), name='users_filtered_list'),
    path('admin-list', UserAdminListView.as_view(), name='users_admin_list'),
    path('<int:pk>/block', BlockUserView.as_view(), name='user_block'),
    path('<int:pk>/unblock', UnBlockUserView.as_view(), name='user_unblock'),
    path('<int:pk>/to_admin', UserToAdminView.as_view(), name='user_to_admin'),
    path('<int:pk>/to_moderator', UserToModeratorView.as_view(), name='user_to_moderator'),
    path("<int:pk>/suspend", AdminSuspendUserView.as_view(), name="admin-user-suspend"),
    path("<int:pk>/unsuspend", AdminUnsuspendUserView.as_view(), name="admin-user-unsuspend"),
    path('<int:pk>/to_user', UserToUserView.as_view(), name='user_to_user'),


]
