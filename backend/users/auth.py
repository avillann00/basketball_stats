from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model
import jwt
import os
from django.utils.crypto import get_random_string

class NextAuthJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        
        try:
            payload = jwt.decode(token, os.environ.get('NEXTAUTH_SECRET'), algorithms=["HS256"])
            
            User = get_user_model()
            user_id = payload.get("id")
            email = payload.get("email")
            
            if not user_id and not email:
                raise AuthenticationFailed('User ID or email not provided in token')
            
            try:
                if user_id:
                    user = User.objects.get(id=user_id)
                else:
                    user = User.objects.get(email=email)
                return (user, None)
            except User.DoesNotExist:
                if not email:
                    raise AuthenticationFailed('Email required to create user')
                
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        "username": email.split("@")[0],
                        "first_name": payload.get("first_name", ""),
                        "last_name": payload.get("last_name", ""),
                        "password": get_random_string(32),
                    }
                )
                return (user, None)
                
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            return None

class DjangoJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except (InvalidToken, TokenError):
            return None

class CombinedJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        nextauth_result = NextAuthJWTAuthentication().authenticate(request)
        if nextauth_result:
            return nextauth_result
        
        django_result = DjangoJWTAuthentication().authenticate(request)
        if django_result:
            return django_result
        
        return None
