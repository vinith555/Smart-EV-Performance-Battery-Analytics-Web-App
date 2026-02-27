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
            print(f"❌ .env file not found at {self.env_file.absolute()}")
            print(f"   Create it with: cp .env.example .env")
            return

        load_dotenv(self.env_file)
        print(f"✅ Loaded environment from {self.env_file}")

    def check_required_vars(self):
        """Check if all required variables are set."""
        print("\n" + "=" * 60)
        print("CHECKING REQUIRED VARIABLES")
        print("=" * 60)

        missing = []
        for var, description in self.REQUIRED_VARS.items():
            value = os.getenv(var)
            if value:
                # Hide sensitive values
                if var in ["PASSWORD", "SECRET", "KEY"]:
                    display_value = value[:4] + "*" * (len(value) - 8) + value[-4:]
                else:
                    display_value = value
                print(f"✅ {var:<25} = {display_value}")
                self.loaded_vars[var] = value
            else:
                print(f"❌ {var:<25} - MISSING")
                missing.append(var)

        if missing:
            print(f"\n⚠️  {len(missing)} required variable(s) missing!")
            return False
        else:
            print(f"\n✅ All required variables are set!")
            return True

    def check_optional_vars(self):
        """Check optional variables."""
        print("\n" + "=" * 60)
        print("CHECKING OPTIONAL VARIABLES")
        print("=" * 60)

        for var, description in self.OPTIONAL_VARS.items():
            value = os.getenv(var)
            if value:
                # Hide sensitive values
                if var in ["PASSWORD", "SECRET", "KEY"]:
                    display_value = value[:4] + "*" * (len(value) - 8) + value[-4:]
                else:
                    display_value = value
                print(f"✅ {var:<25} = {display_value}")
            else:
                print(f"⚪ {var:<25} - not set (optional)")

    def validate_values(self):
        """Validate the format and values of variables."""
        print("\n" + "=" * 60)
        print("VALIDATING VALUES")
        print("=" * 60)

        issues = []

        # Check DEBUG is boolean
        debug = os.getenv("DEBUG", "False")
        if debug not in ["True", "False"]:
            issues.append(f"DEBUG must be 'True' or 'False', got: {debug}")
            print(f"❌ DEBUG must be 'True' or 'False', got: {debug}")
        else:
            print(f"✅ DEBUG is valid: {debug}")

        # Check DB_PORT is numeric
        port = os.getenv("DB_PORT")
        if port and not port.isdigit():
            issues.append(f"DB_PORT must be numeric, got: {port}")
            print(f"❌ DB_PORT must be numeric, got: {port}")
        elif port:
            print(f"✅ DB_PORT is valid: {port}")

        # Check SECRET_KEY is not the default
        secret_key = os.getenv("SECRET_KEY")
        if secret_key and "django-insecure" in secret_key:
            issues.append("SECRET_KEY is using default insecure value")
            print(f"⚠️  SECRET_KEY is using default insecure value")
        elif secret_key:
            print(f"✅ SECRET_KEY appears to be set")

        # Check ALLOWED_HOSTS is not empty
        allowed = os.getenv("ALLOWED_HOSTS")
        if not allowed or allowed == "":
            issues.append("ALLOWED_HOSTS is empty")
            print(f"❌ ALLOWED_HOSTS is empty")
        elif allowed:
            hosts = [h.strip() for h in allowed.split(",")]
            print(f"✅ ALLOWED_HOSTS set to: {hosts}")

        if issues:
            print(f"\n⚠️  {len(issues)} validation issue(s) found!")
            return False
        else:
            print(f"\n✅ All values are valid!")
            return True

    def show_example(self):
        """Show example .env file."""
        print("\n" + "=" * 60)
        print("EXAMPLE .env FILE")
        print("=" * 60)

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
        print(example)

    def create_from_example(self):
        """Create .env file from .env.example."""
        example_file = Path(".env.example")

        if not example_file.exists():
            print(f"❌ .env.example not found")
            return False

        if self.env_file.exists():
            print(f"⚠️  .env already exists, skipping creation")
            return False

        with open(example_file, "r") as f:
            content = f.read()

        with open(self.env_file, "w") as f:
            f.write(content)

        print(f"✅ Created {self.env_file} from {example_file}")
        print(f"   Now edit {self.env_file} with your actual values")
        return True

    def run_full_check(self):
        """Run full environment check."""
        print("\n" + "=" * 60)
        print("FULL ENVIRONMENT CHECK")
        print("=" * 60)

        required_ok = self.check_required_vars()
        self.check_optional_vars()
        values_ok = self.validate_values()

        print("\n" + "=" * 60)
        if required_ok and values_ok:
            print("✅ ENVIRONMENT CHECK PASSED!")
            print("=" * 60)
            return True
        else:
            print("❌ ENVIRONMENT CHECK FAILED!")
            print("=" * 60)
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
