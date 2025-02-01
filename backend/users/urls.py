from .views import CreateUserView
from django.urls import path

urlpatterns = [
    path('register/', CreateUserView.as_view(), name='register')
]
