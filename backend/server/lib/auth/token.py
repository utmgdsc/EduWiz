from typing import TypedDict


class DecodedToken(TypedDict):
    """
    DecodedToken is a TypedDict that represents the structure of a decoded authentication token.

    Attributes:
        auth_time (int): The time the user was authenticated, represented as a Unix timestamp.
        uid (str): The unique identifier for the user.
        iss (str): The issuer of the token, typically a URL.
        aud (str): The audience for which the token is intended.
        iat (int): The time the token was issued, represented as a Unix timestamp.
        exp (int): The expiration time of the token, represented as a Unix timestamp.
        sub (str): The subject of the token, typically the user's unique identifier.
        email (str): The email address of the user.
        email_verified (bool): Indicates whether the user's email address has been verified.
        name (str): The full name of the user.
        firebase (dict): Additional Firebase-specific claims included in the token.
    """

    auth_time: int
    uid: str
    iss: str
    aud: str
    iat: int
    exp: int
    sub: str
    email: str
    email_verified: bool
    name: str
    firebase: dict
