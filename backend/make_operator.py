"""
Bya3mel user operator (aw yrajj3o customer).

    python make_operator.py ali@gmail.com            -> operator
    python make_operator.py ali@gmail.com customer   -> customer

El user lazem ykoun 3emel sign up abel. Ba3den lazem ya3mel log out w login marra tenye.
"""
import sys

import database as db

if len(sys.argv) < 2:
    print("Usage: python make_operator.py <email> [operator|customer|admin]")
    sys.exit(1)

email = sys.argv[1].strip().lower()
role = sys.argv[2] if len(sys.argv) > 2 else "operator"
if role not in ("operator", "customer", "admin"):
    print("Role must be operator, customer or admin.")
    sys.exit(1)

db.create_tables()
if db.set_role(email, role):
    print(f"{email} is now: {role}. Log out and log in again to see the change.")
else:
    print(f"No user with the email {email}. Sign up first.")
