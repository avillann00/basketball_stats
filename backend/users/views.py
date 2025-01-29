from .serializers import UserSerializer
from rest_framework.views import APIView, Response
from rest_framework.permissions import AllowAny

class CreateUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
