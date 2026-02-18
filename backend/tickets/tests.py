from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from tickets.models import Ticket


class TicketModelTest(TestCase):
    def setUp(self):
        self.ticket = Ticket.objects.create(
            title="Test Issue",
            description="This is a test ticket",
            category="technical",
            priority="high",
            status="open"
        )

    def test_ticket_creation(self):
        self.assertEqual(self.ticket.title, "Test Issue")
        self.assertEqual(self.ticket.category, "technical")
        self.assertEqual(self.ticket.priority, "high")
        self.assertEqual(self.ticket.status, "open")

    def test_ticket_str(self):
        self.assertEqual(str(self.ticket), "Test Issue (high)")


class TicketAPITest(APITestCase):
    def setUp(self):
        self.ticket_data = {
            'title': 'Cannot login',
            'description': 'I cannot login to my account',
            'category': 'account',
            'priority': 'high'
        }

    def test_create_ticket(self):
        response = self.client.post(reverse('ticket-list'), self.ticket_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ticket.objects.count(), 1)

    def test_list_tickets(self):
        Ticket.objects.create(**self.ticket_data)
        response = self.client.get(reverse('ticket-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_by_priority(self):
        Ticket.objects.create(**self.ticket_data)
        response = self.client.get(reverse('ticket-list') + '?priority=high')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_search_tickets(self):
        Ticket.objects.create(**self.ticket_data)
        response = self.client.get(reverse('ticket-list') + '?search=cannot')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_stats_endpoint(self):
        Ticket.objects.create(**self.ticket_data)
        response = self.client.get(reverse('ticket-stats'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_tickets', response.data)
        self.assertIn('priority_breakdown', response.data)
