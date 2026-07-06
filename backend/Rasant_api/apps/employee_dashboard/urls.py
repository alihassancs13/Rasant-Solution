from django.urls import path
from . import views
urlpatterns = [
          path('add_employee/', views.add_employee, name='add-employee'),
          path('get_employees/', views.list_employees, name='list-employees'),
          path('get_employee/<int:pk>/', views.get_employee_detail, name='employee-detail'),
          path('update_employee/<int:pk>/', views.update_employee, name='update-employee'),
]