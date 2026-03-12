"""
Utility script to manage and validate environment variables.
Usage: python env_utils.py
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import sys


class EnvManager:
    """Manage and validate environment variables."""

    REQUIRED_VARS = {
        "SECRET_KEY": "Django secret key",
        "DEBUG": "Debug mode (True/False)",
        "DB_NAME": "Database name",
        "DB_USER": "Database user",
        "DB_PASSWORD": "Database password",
        "DB_HOST": "Database host",
        "DB_PORT": "Database port",
    }

    OPTIONAL_VARS = {
        "ALLOWED_HOSTS": "Allowed hosts (comma-separated)",
        "JWT_SECRET": "JWT secret key",
        "JWT_ALGORITHM": "JWT algorithm",
        "EMAIL_HOST": "Email service host",
        "EMAIL_PORT": "Email service port",
        "EMAIL_HOST_USER": "Email host user",
        "EMAIL_HOST_PASSWORD": "Email host password",
        "AWS_ACCESS_KEY_ID": "AWS access key",
        "AWS_SECRET_ACCESS_KEY": "AWS secret key",
        "REDIS_URL": "Redis connection URL",
    }

    def __init__(self, env_file=".env"):
        """Initialize EnvManager."""
        self.env_file = Path(env_file)
        self.loaded_vars = {}
        self.load_env()

    def load_env(self):
        """Load environment variables from .env file."""
        if not self.env_file.exists():
            return

        load_dotenv(self.env_file)

    def check_required_vars(self):
        """Check if all required variables are set."""
        missing = []
        for var, description in self.REQUIRED_VARS.items():
            value = os.getenv(var)
            if value:
                # Hide sensitive values
                if var in ["PASSWORD", "SECRET", "KEY"]:
                    display_value = value[:4] + "*" * (len(value) - 8) + value[-4:]
                else:
                    display_value = value
                self.loaded_vars[var] = value
            else:
                missing.append(var)

        if missing:
            return False
        else:
            return True

    def check_optional_vars(self):
        """Check optional variables."""
        for var, description in self.OPTIONAL_VARS.items():
            value = os.getenv(var)
            if value:
                # Hide sensitive values
                if var in ["PASSWORD", "SECRET", "KEY"]:
                    display_value = value[:4] + "*" * (len(value) - 8) + value[-4:]
                else:
                    display_value = value

    def validate_values(self):
        """Validate the format and values of variables."""
        issues = []

        # Check DEBUG is boolean
        debug = os.getenv("DEBUG", "False")
        if debug not in ["True", "False"]:
            issues.append(f"DEBUG must be 'True' or 'False', got: {debug}")

        # Check DB_PORT is numeric
        port = os.getenv("DB_PORT")
        if port and not port.isdigit():
            issues.append(f"DB_PORT must be numeric, got: {port}")

        # Check SECRET_KEY is not the default
        secret_key = os.getenv("SECRET_KEY")
        if secret_key and "django-insecure" in secret_key:
            issues.append("SECRET_KEY is using default insecure value")

        # Check ALLOWED_HOSTS is not empty
        allowed = os.getenv("ALLOWED_HOSTS")
        if not allowed or allowed == "":
            issues.append("ALLOWED_HOSTS is empty")

        if issues:
            return False
        else:
            return True

    def show_example(self):
        """Show example .env file."""
        example = """
# Django Core Settings
SECRET_KEY=your-super-secret-key-here-change-this
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# Database Configuration
DB_NAME=ev_analytics_db
DB_USER=postgres
DB_PASSWORD=your-secure-password-here
DB_HOST=localhost
DB_PORT=5432

# JWT Settings (Optional)
JWT_SECRET=your-jwt-secret-key-here
JWT_ALGORITHM=HS256

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
"""

    def create_from_example(self):
        """Create .env file from .env.example."""
        example_file = Path(".env.example")

        if not example_file.exists():
            return False

        if self.env_file.exists():
            return False

        with open(example_file, "r") as f:
            content = f.read()

        with open(self.env_file, "w") as f:
            f.write(content)

        return True

    def run_full_check(self):
        """Run full environment check."""
        required_ok = self.check_required_vars()
        self.check_optional_vars()
        values_ok = self.validate_values()

        if required_ok and values_ok:
            return True
        else:
            return False


def main():
    """Main function."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Manage and validate environment variables"
    )
    parser.add_argument(
        "--check", action="store_true", help="Run full environment check"
    )
    parser.add_argument(
        "--create", action="store_true", help="Create .env from .env.example"
    )
    parser.add_argument("--example", action="store_true", help="Show example .env file")
    parser.add_argument(
        "--env-file", default=".env", help="Path to .env file (default: .env)"
    )

    args = parser.parse_args()

    manager = EnvManager(args.env_file)

    if args.create:
        manager.create_from_example()
    elif args.example:
        manager.show_example()
    elif args.check or not any([args.create, args.example]):
        # Default action: full check
        success = manager.run_full_check()
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
