from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase


class ClientConfigViewTests(APITestCase):
    endpoint = "/api/v1/auth/config/"

    @override_settings(
        FIREBASE_WEB_CONFIG={
            "apiKey": "test-api-key",
            "authDomain": "example.firebaseapp.com",
            "projectId": "example",
            "storageBucket": "example.appspot.com",
            "messagingSenderId": "1234567890",
            "appId": "1:1234567890:web:abcdef",
            "measurementId": "G-EXAMPLE",
        }
    )
    def test_returns_firebase_config(self):
        response = self.client.get(self.endpoint)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertIn("firebase", payload)
        firebase_cfg = payload["firebase"]
        self.assertEqual(firebase_cfg["apiKey"], "test-api-key")
        self.assertIn("measurementId", firebase_cfg)

    @override_settings(FIREBASE_WEB_CONFIG={"apiKey": "", "authDomain": ""})
    def test_missing_configuration_returns_error(self):
        response = self.client.get(self.endpoint)
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        payload = response.json()
        self.assertIn("error", payload)
        self.assertIn("missing", payload)
        self.assertIn("FIREBASE_WEB_API_KEY", payload["missing"])
