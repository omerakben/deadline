"""Tests for the workspace template onboarding endpoint."""

from rest_framework.test import APIClient, APITestCase

from auth_firebase.authentication import FirebaseUser
from workspaces.models import EnvironmentType, Workspace


class ApplyTemplatesAPITests(APITestCase):
    """Verify showcase templates can be provisioned for an authenticated user."""

    endpoint = "/api/v1/workspaces/templates/apply/"

    def setUp(self):
        super().setUp()
        self.client = APIClient()
        self.user = FirebaseUser(uid="test-user-uid")
        self.client.force_authenticate(user=self.user)

        for order, (slug, name) in enumerate(
            [
                ("DEV", "Development"),
                ("STAGING", "Staging"),
                ("PROD", "Production"),
            ]
        ):
            EnvironmentType.objects.get_or_create(
                slug=slug, defaults={"name": name, "display_order": order}
            )

    def test_apply_templates_creates_showcase_workspaces(self):
        response = self.client.post(self.endpoint)

        self.assertEqual(response.status_code, 201)
        payload = response.json()

        self.assertIn("created", payload)
        created = payload["created"]
        self.assertEqual(len(created), 3)

        stored_names = list(
            Workspace.objects.filter(owner_uid=self.user.uid).values_list("name", flat=True)
        )
        self.assertEqual(len(stored_names), 3)
        self.assertTrue(all(name.startswith("PRD") for name in stored_names))

        for workspace in created:
            counts = workspace.get("artifact_counts", {})
            self.assertGreater(counts.get("total", 0), 0)

    def test_reapplying_templates_generates_unique_names(self):
        first = self.client.post(self.endpoint)
        self.assertEqual(first.status_code, 201)

        second = self.client.post(self.endpoint)
        self.assertEqual(second.status_code, 201)

        names = list(
            Workspace.objects.filter(owner_uid=self.user.uid).values_list("name", flat=True)
        )

        self.assertEqual(len(names), 6)
        self.assertEqual(len(names), len(set(names)))
