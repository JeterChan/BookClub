# backend/app/services/member_service.py
from sqlmodel import Session, select

from app.models.book_club_member import BookClubMember
from app.services.user_service import UserService

class MemberService:
    def __init__(self, session: Session):
        self.session = session
        self.user_service = UserService(session)

    def get_membership(self, *, user_id: int, club_id: int) -> BookClubMember | None:
        statement = select(BookClubMember).where(
            BookClubMember.user_id == user_id,
            BookClubMember.book_club_id == club_id
        )
        return self.session.exec(statement).first()
