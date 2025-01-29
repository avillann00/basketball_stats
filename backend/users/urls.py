from .views import CreateUserView
from django.urls import path

url_patterns = [
    path('register/', CreateUserView.as_view(), name='register')
]
