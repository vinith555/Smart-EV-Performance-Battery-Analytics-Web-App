from django.core.management.base import BaseCommand
from users.models import User


class Command(BaseCommand):
    help = "Fix plain text passwords in database by hashing them"

    def handle(self, *args, **options):
        """Hash any plain text passwords found in the database."""

        users_to_fix = []

        # Check all users
        for user in User.objects.all():
            # Django hashed passwords start with algorithm identifier like 'pbkdf2_sha256$'
            # If password doesn't start with this, it's likely plain text
            if not user.password.startswith("pbkdf2_sha256$"):
                users_to_fix.append(user)

        if not users_to_fix:
            self.stdout.write(
                self.style.SUCCESS(
                    "No plain text passwords found. All passwords are properly hashed!"
                )
            )
            return

        self.stdout.write(f"Found {len(users_to_fix)} users with plain text passwords:")
        for user in users_to_fix:
            self.stdout.write(f"  - {user.email} (ID: {user.user_id})")

        # Ask for confirmation
        confirm = input("\nDo you want to hash these passwords? (yes/no): ")

        if confirm.lower() not in ["yes", "y"]:
            self.stdout.write(self.style.WARNING("Operation cancelled."))
            return

        # Fix passwords
        fixed_count = 0
        for user in users_to_fix:
            plain_password = user.password  # Store the plain text password
            user.set_password(plain_password)  # This will hash it
            user.save()
            fixed_count += 1
            self.stdout.write(self.style.SUCCESS(f"✓ Fixed password for {user.email}"))

        self.stdout.write(
            self.style.SUCCESS(f"\nSuccessfully hashed {fixed_count} passwords!")
        )
        self.stdout.write(
            self.style.SUCCESS("All users can now login with their original passwords.")
        )
