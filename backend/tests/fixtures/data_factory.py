"""Data factories for generating test data."""
from faker import Faker
from typing import Dict, Any
import random

fake = Faker()


def create_test_user_data(
    email: str = None,
    password: str = "Test@1234",
    display_name: str = None
) -> Dict[str, Any]:
    """Create test user registration data."""
    return {
        "email": email or fake.email(),
        "password": password,
        "display_name": display_name or fake.name()
    }


def create_test_book_club_data(
    name: str = None,
    description: str = None,
    visibility: str = "public",
    tag_ids: list = None
) -> Dict[str, Any]:
    """Create test book club data."""
    return {
        "name": name or fake.catch_phrase(),
        "description": description or fake.text(max_nb_chars=200),
        "visibility": visibility,
        "tag_ids": tag_ids or []
    }


def create_test_discussion_data(
    title: str = None,
    content: str = None
) -> Dict[str, Any]:
    """Create test discussion topic data."""
    return {
        "title": title or fake.sentence(),
        "content": content or fake.paragraph()
    }


def create_test_comment_data(content: str = None) -> Dict[str, Any]:
    """Create test discussion comment data."""
    return {
        "content": content or fake.paragraph()
    }


def create_test_event_data(
    title: str = None,
    description: str = None,
    start_time: str = None,
    end_time: str = None,
    location: str = None,
    max_participants: int = None
) -> Dict[str, Any]:
    """Create test event data."""
    from datetime import datetime, timedelta
    
    start = datetime.now() + timedelta(days=random.randint(1, 30))
    end = start + timedelta(hours=2)
    
    return {
        "title": title or fake.catch_phrase(),
        "description": description or fake.text(max_nb_chars=200),
        "start_time": start_time or start.isoformat(),
        "end_time": end_time or end.isoformat(),
        "location": location or fake.address(),
        "max_participants": max_participants or random.randint(10, 50)
    }


def create_test_interest_tag_data(name: str = None) -> Dict[str, Any]:
    """Create test interest tag data."""
    return {
        "name": name or fake.word()
    }
