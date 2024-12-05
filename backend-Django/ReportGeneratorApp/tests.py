# myapp/tests.py
import unittest
from django.test import TestCase
from unittest.mock import patch
from django.http import HttpRequest
from .models import Visitors
import pandas as pd
from django.core.files.uploadedfile import SimpleUploadedFile
import uuid
import os
from .views import retrieve_chart_data

class RetrieveChartDataTest(TestCase):

    def setUp(self):
        # Create mock CSV file content for testing
        self.test_csv_content = "id,name,age\n1,John,30\n2,Jane,25"
        self.test_csv_file = SimpleUploadedFile("test.csv", self.test_csv_content.encode('utf-8'))

        # Create a visitor instance with the mock file
        self.visitor_data = {
            "uuid": uuid.uuid4(),
            "file_name": "visitor_test_1.csv",
            "orig_csv_file": self.test_csv_file
        }
        self.visitor = Visitors.objects.create(**self.visitor_data)

    @patch('builtins.print')  # Patch the built-in print function to capture output
    def test_retrieve_chart_data_prints_columns(self, mock_print):
        # Create a mock GET request
        request = HttpRequest()
        request.method = 'GET'

        # Call the `retrieve_chart_data` function
        retrieve_chart_data(request, self.visitor)

        # Ensure that print was called
        mock_print.assert_called()

        # Check if the print function was called with the columns of the DataFrame
        # Capture the last print statement and compare it to the expected columns
        args, kwargs = mock_print.call_args
        printed_output = args[0]  # The first argument is the printed content (df.columns)
        
        # Check if the printed output contains the column names
        expected_columns = ['id', 'name', 'age']  # Based on the CSV content
        for col in expected_columns:
            self.assertIn(col, printed_output)

    def tearDown(self):
        # Clean up: Remove the file after the test
        if hasattr(self.visitor, 'orig_csv_file') and os.path.exists(self.visitor.orig_csv_file.path):
            os.remove(self.visitor.orig_csv_file.path)

