from django.core.management.base import BaseCommand
from django.db import OperationalError, connection
from django.db.backends.mysql.base import DatabaseWrapper
import time

connection: DatabaseWrapper = connection

class Command(BaseCommand):
    def handle(self, *args, **options):
        self.stdout.write("Waiting for database...")

        con_db = False

        while not con_db:
            try:
                connection.ensure_connection()
                con_db = True
            except OperationalError:
                self.stdout.write("Trying connect to database")
                time.sleep(5)
