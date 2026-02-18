from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from datetime import datetime, timedelta

from .models import Ticket
from .serializers import TicketSerializer, ClassifySerializer
from .llm_service import LLMService

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    llm_service = LLMService()

    def get_queryset(self):
        queryset = Ticket.objects.all()
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('-created_at')

    @action(detail=False, methods=['post'])
    def classify(self, request):
        """
        Classify a ticket description using LLM
        """
        serializer = ClassifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        description = serializer.validated_data['description']
        category, priority = self.llm_service.classify_ticket(description)
        
        return Response({
            'suggested_category': category,
            'suggested_priority': priority
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get aggregated statistics using database-level aggregation
        """
        total_tickets = Ticket.objects.count()
        open_tickets = Ticket.objects.filter(status='open').count()
        
        # Calculate avg tickets per day
        if total_tickets > 0:
            oldest_ticket = Ticket.objects.order_by('created_at').first()
            if oldest_ticket:
                days_diff = max((datetime.now().astimezone() - oldest_ticket.created_at).days, 1)
                avg_per_day = round(total_tickets / days_diff, 1)
            else:
                avg_per_day = 0
        else:
            avg_per_day = 0
        
        # Get priority breakdown
        priority_breakdown = {
            'low': Ticket.objects.filter(priority='low').count(),
            'medium': Ticket.objects.filter(priority='medium').count(),
            'high': Ticket.objects.filter(priority='high').count(),
            'critical': Ticket.objects.filter(priority='critical').count(),
        }
        
        # Get category breakdown
        category_breakdown = {
            'billing': Ticket.objects.filter(category='billing').count(),
            'technical': Ticket.objects.filter(category='technical').count(),
            'account': Ticket.objects.filter(category='account').count(),
            'general': Ticket.objects.filter(category='general').count(),
        }
        
        return Response({
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'avg_tickets_per_day': avg_per_day,
            'priority_breakdown': priority_breakdown,
            'category_breakdown': category_breakdown,
        }, status=status.HTTP_200_OK)
