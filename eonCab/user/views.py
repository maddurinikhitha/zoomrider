import os
import jwt
import json
import uuid
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.middleware.csrf import get_token
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from eonCab import settings
from eonCab.settings import blackListedTokens
from user.decorators import check_blacklisted_token
from user.models import User, Driver
from user.serializers import UserSerializer, UserProfileResponse, UserRegisterResponse, \
    UserRegisterRequest, UserLoginRequest, UserLoginResponse, \
    RefreshTokenResponse, UserUpdateRequest, UserUpdateResponse, \
    UserUpdatePasswordRequest, UserGeneralSerializer, UserForgetPasswordRequest
from user.utils import generate_access_token, generate_refresh_token


@extend_schema(
    description="Fetch logged-in user details",
    responses={
        200: OpenApiResponse(
            response=UserProfileResponse
        )
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@check_blacklisted_token
def user_home(request):
    """
   route to retrieve logged-in user details
   """
    print(request.user)
    print(request.user.is_authenticated)
    if request.user and request.user.is_authenticated:
        serialized_user = UserSerializer(request.user).data
        del serialized_user['id']
        return Response(
            {
                'status': True,
                'message': 'user profile',
                'user': serialized_user
            }
        )
    return Response(
        {
            'status': False,
            'message': 'not logged in'
        }
    )


@extend_schema(
    description="Register a new user",
    request=UserRegisterRequest,
    responses={
        200: OpenApiResponse(
            response=UserRegisterResponse
        )
    }
)
@permission_classes([AllowAny])
@api_view(['POST'])
def user_register(request):
    """
    route to register a user on platform
    """
    context = {}
    jsn: dict
    try:
        jsn = json.loads(request.body)
    except json.decoder.JSONDecodeError:
        jsn = {}
    if jsn:
        context = jsn.copy()
        if 'password' in context:
            del context['password']

    if not ('email' in jsn and 'password' in jsn and 'name' in jsn and 'gender' in jsn and
            'phone' in jsn and 'address' in jsn and 'account_type' in jsn):
        return Response(
            {
                'status': False,
                'message': 'registration unsuccessful (required data: name, email, password, phone, gender, address, account_type)',
            }
        )
    try:
        UserModel = get_user_model()
        user = UserModel(
            email=jsn['email'],
            name=jsn['name'],
            username=f"{jsn['name'].split(' ')[0]}_{str(uuid.uuid4())[-12:-1]}",
            phone=jsn['phone'],
            gender=jsn['gender'],
            address=jsn['address'],
            account_type=jsn['account_type']
        )
        user.set_password(jsn['password'])
        user.save()
        
        if jsn['account_type'] == User.AccountType.DRIVER:
            driver = Driver(user.id, driver_license=jsn['license'] if 'license' in jsn else None)
            driver.save()


    except IntegrityError as err:
        
        return Response(
            {
                'status': "duplicate",
                'message': " already taken by another user, try again with another ",
            }
        )
    except IndexError:
        return Response(
            {
                'status': False,
                'message': 'Duplication Found!',
            }
        )
    
    
    if jsn:
        return Response(
            {
                'status': True,
                'message': 'User registered!',
                'context': context
            }
        )
    


@extend_schema(
    description="login user",
    request=UserLoginRequest,
    responses={
        200: OpenApiResponse(
            response=UserLoginResponse
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    UserModel = get_user_model()
    email = request.data.get('email')
    password = request.data.get('password')
    if email is None or password is None:
        return Response(
            {
                'status': False,
                'message': 'Please provide an Email and a Password to login',
            }
        )
    user = UserModel.objects.filter(email=email).first()
    if user is None:
        return Response(
            {
                'status': False,
                'message': 'Account does not exists!',
            }
        )
    if not user.check_password(password):
        return Response(
            {
                'status': False,
                'message': 'Wrong password!',
            }
        )
    serialized_user = UserSerializer(user).data
    access_token = generate_access_token(user)
    refresh_token = generate_refresh_token(user)
    csrf_token = get_token(request)
    return Response(
        {
            'status': True,
            'message': 'Successfully logged in',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'csrf_token': csrf_token,
            'user': serialized_user
        }
    )


@extend_schema(
    description="Logout user using Authorization header",
    parameters=[
        OpenApiParameter(
            name='Authorization',
            location=OpenApiParameter.HEADER,
            type=str,
            description="auth token which requires 'Token' prefix"
        ),
        OpenApiParameter(
            name='refreshtoken',
            location=OpenApiParameter.HEADER,
            type=str,
            description="pass the refresh token"
        ),
    ],
    responses={
        200: OpenApiResponse(
            response=UserGeneralSerializer
        )
    }
)
@api_view(['POST'])
def user_logout(request):
    access_token = False
    refresh_token = False
    UserModel = get_user_model()
    authorization_header = request.headers.get('Authorization')
    if not authorization_header:
        return Response(
            {
                'status': False,
                'message': 'Authorization credential missing!',
            }
        )
    try:
        access_token = authorization_header.split(' ')[1]
        refresh_token = request.headers.get('refreshtoken')
        payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        if not refresh_token:
            if access_token:
                if access_token not in blackListedTokens:
                    blackListedTokens.add(access_token)
            return Response(
                {
                    'status': True,
                    'message': 'Some Credentials not found in request. (might have already been logged out)',
                }
            )
        try:
            payload = jwt.decode(refresh_token, settings.REFRESH_SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            if access_token:
                if access_token not in blackListedTokens:
                    blackListedTokens.add(access_token)
            return Response(
                {
                    'status': True,
                    'message': 'jwt session has already been timed out. (have been already logged out)',
                }
            )
        user = UserModel.objects.filter(id=payload['user.id']).first()
        if user is None:
            return Response(
                {
                    'status': True,
                    'message': 'user associated with credentials does not exists anymore',
                }
            )
    finally:
        if access_token in blackListedTokens and refresh_token in blackListedTokens:
            return Response(
                {
                    'status': True,
                    'message': 'already logged out!',
                }
            )
        if access_token in blackListedTokens:
            if refresh_token:
                blackListedTokens.add(refresh_token)
            return Response(
                {
                    'status': True,
                    'message': 'already logged out!',
                }
            )
        if refresh_token in blackListedTokens:
            if access_token:
                blackListedTokens.add(access_token)
            return Response(
                {
                    'status': True,
                    'message': 'already logged out!',
                }
            )
        if access_token:
            blackListedTokens.add(access_token)
        if refresh_token:
            blackListedTokens.add(refresh_token)
    return Response(
        {
            'status': True,
            'message': 'successfully logged out!',
        }
    )


@extend_schema(
    description="refresh user token",
    parameters=[
        OpenApiParameter(
            name='refreshtoken',
            location=OpenApiParameter.HEADER,
            type=str
        )
    ],
    responses={
        200: OpenApiResponse(
            response=RefreshTokenResponse
        )
    }
)
@api_view(['PUT'])
@check_blacklisted_token
def refresh_token_view(request):
    UserModel = get_user_model()
    refresh_token = request.headers.get('refreshtoken')
    if not refresh_token:
        return Response(
            {
                'status': False,
                'message': 'refresh token missing in header',
            }
        )
    try:
        payload = jwt.decode(refresh_token, settings.REFRESH_SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return Response(
            {
                'status': False,
                'message': 'refresh token expired!',
            }
        )
    except jwt.InvalidSignatureError or jwt.DecodeError:
        return Response(
            {
                'status': False,
                'message': 'invalid refresh token!',
            }
        )
    user = UserModel.objects.filter(id=payload['user.id']).first()
    if user is None:
        return Response(
            {
                'status': False,
                'message': 'user associated with received refresh token does not exists anymore!',
            }
        )
    access_token = generate_access_token(user)
    # csrf_token = get_token(request)
    return Response(
        {
            'status': True,
            'message': 'access token refreshed',
            'access_token': access_token,
            # 'csrf_token': csrf_token,
        }
    )


@extend_schema(
    description="deletes logged-in user's profile",
    responses={
        200: OpenApiResponse(
            response=UserGeneralSerializer
        )
    }
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@check_blacklisted_token
def user_delete(request):
    if request.user.account_type == User.AccountType.DRIVER:
        driver = Driver.objects.filter(id=request.user.id).first()
        if driver is not None:
            driver.delete()
    request.user.delete()
    return Response(
        {
            'status': True,
            'message': 'User profile successfully deleted',
        }
    )


@extend_schema(
    description="update user details. Must pass atleast one of the parameters!",
    request=UserUpdateRequest,
    responses={
        200: OpenApiResponse(
            response=UserUpdateResponse
        )
    }
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@check_blacklisted_token
def user_update(request):
    jsn: dict
    user_fields = ['email', 'name', 'username', 'phone', 'address', 'dob', 'gender', 'about']
    try:
        jsn = json.loads(request.body)
    except json.decoder.JSONDecodeError:
        jsn = {}
    if len(jsn) == 0 or not(True in [key in user_fields for key in jsn.keys()]):
        return Response(
            {
                'status': False,
                'message': 'provide at least one of following to update profile (email, name, username phone, address, dob, gender, about)',
            }
        )
    print("this is user")
    print(request.user.AccountType.DRIVER )
   
    print(request.data)
    for key in list(jsn):
        if key not in user_fields:
            del jsn[key]
    try:
        user = request.user
        user.name = jsn['name'] if 'name' in jsn else user.name
        user.email = jsn['email'] if 'email' in jsn else user.email
        user.username = jsn['username'] if 'username' in jsn else user.username
        user.phone = jsn['phone'] if 'phone' in jsn else user.phone
        user.dob = jsn['dob'] if 'dob' in jsn else user.dob
        user.address = jsn['address'] if 'address' in jsn else user.address
        user.gender = jsn['gender'] if 'gender' in jsn else user.gender
        user.about = jsn['about'] if 'about' in jsn else user.about
        user.save()

        if user.account_type == user.AccountType.DRIVER :            
            user.driver.save()
    except IntegrityError as err:
     
        return Response(
            {
                'status': False,
                'message': ' already taken by another user, try again with another ',
            }
        )
    except IndexError:
        return Response(
            {
                'status': False,
                'message': 'Duplication Found!',
            }
        )
    if jsn:
        return Response(
            {
                'status': True,
                'message': 'User updated!',
                'context': jsn
            }
        )


@extend_schema(
    description="update user password",
    request=UserUpdatePasswordRequest,
    responses={
        200: OpenApiResponse(
            response=UserGeneralSerializer
        )
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@check_blacklisted_token
def user_update_password(request):
    jsn: dict
    try:
        jsn = request.data
    except json.decoder.JSONDecodeError:
        jsn = {}
    if False in [key in jsn.keys() for key in ['new_password', 'old_password']]:
        return Response(
            {
                'status': False,
                'message': 'provide new and old passwords to update password',
            }
        )
    if request.user.check_password(jsn['old_password']):
        request.user.set_password(jsn['new_password'])
        request.user.save()
        return Response(
            {
                'status': True,
                'message': 'Password changed'
            }
        )
    return Response(
        {
            'status': False,
            'message': 'Incorrect old password!'
        }
    )


@extend_schema(
    description="set new user password (forgotten)",
    request=UserForgetPasswordRequest,
    responses={
        200: OpenApiResponse(
            response=UserGeneralSerializer
        )
    }
)
@permission_classes([AllowAny])
@api_view(['POST'])
def user_forget_password(request):
    jsn: dict
    try:
        jsn = request.data
    except json.decoder.JSONDecodeError:
        jsn = {}
    if False in [key in jsn.keys() for key in ['email', 'password', 'skey']]:
        return Response(
            {
                'status': False,
                'message': 'provide email, password & skey to set new password!',
            }
        )
    user = User.objects.filter(email=jsn['email']).first()
    if user is None:
        return Response(
            {
                'status': False,
                'message': 'user account for given email does not exists!'
            }
        )
    if jsn['skey'] == os.environ.get('UC_FORGET_PASS_SECRET'):
        user.set_password(jsn['password'])
        user.save()
        return Response(
            {
                'status': True,
                'message': 'Password changed'
            }
        )
    else:
        return Response(
            {
                'status': False,
                'message': 'Invalid SKEY !'
            }
        )
