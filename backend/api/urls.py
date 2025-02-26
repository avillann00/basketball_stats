from django.urls import path
from .views import PlayerView, TeamView, StatView, GameView

urlpatterns = [
    path('player/<str:first>/<str:last>', PlayerView.as_view(), name='player'),
    path('team/<str:city_name>/<str:team_name>', TeamView.as_view(), name='team'),
    path('stats/<int:pk>/', StatView.as_view(), name='stats'),
    path('games/<int:pk>/', GameView.as_view(), name='games')
]
