from .views import CreateUserView, LoginView
from django.urls import path

urlpatterns = [
    path('register/', CreateUserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login')
]
