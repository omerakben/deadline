"""
Django management command to create a superuser for Railway deployment.
This can be run via: railway run python manage.py create_railway_superuser
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a superuser for Railway deployment"

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            type=str,
            default="admin",
            help="Username for the superuser",
        )
        parser.add_argument(
            "--email",
            type=str,
            default="admin@deadline.app",
            help="Email for the superuser",
        )
        parser.add_argument(
            "--password",
            type=str,
            default="admin123",
            help="Password for the superuser",
        )

    def handle(self, *args, **options):
        User = get_user_model()
        username = options["username"]
        email = options["email"]
        password = options["password"]

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'Superuser "{username}" already exists.')
            )
            return

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )

        self.stdout.write(
            self.style.SUCCESS(f'✅ Superuser "{username}" created successfully!')
        )
        self.stdout.write(f"   Username: {username}")
        self.stdout.write(f"   Email: {email}")
        self.stdout.write(f"   Password: {password}")
        self.stdout.write("")
        self.stdout.write(
            "   Login at: https://deadline-production.up.railway.app/admin/"
        )
