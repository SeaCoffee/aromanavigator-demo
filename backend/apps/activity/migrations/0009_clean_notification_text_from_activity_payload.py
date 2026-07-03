from django.db import migrations


def clean_notification_text_from_activity_payload(apps, schema_editor):
    ActivityEventModel = apps.get_model("activity", "ActivityEventModel")

    queryset = ActivityEventModel.objects.exclude(payload={})

    for event in queryset.iterator(chunk_size=500):
        payload = event.payload

        if not isinstance(payload, dict):
            continue

        if "notification_text" not in payload:
            continue

        clean_payload = dict(payload)
        clean_payload.pop("notification_text", None)

        event.payload = clean_payload
        event.save(update_fields=["payload"])


def restore_notification_text_to_follow_activity_payload(apps, schema_editor):
    """
    РћР±СЂР°С‚РЅР°СЏ РјРёРіСЂР°С†РёСЏ СѓСЃР»РѕРІРЅР°СЏ: РЅСѓР¶РЅР° С‚РѕР»СЊРєРѕ С‡С‚РѕР±С‹ migration Р±С‹Р»Р° reversible.
    Р’РѕР·РІСЂР°С‰Р°С‚СЊ notification_text РІ activity Р°СЂС…РёС‚РµРєС‚СѓСЂРЅРѕ РЅРµРїСЂР°РІРёР»СЊРЅРѕ,
    РЅРѕ РґР»СЏ rollback РІРѕСЃСЃС‚Р°РЅР°РІР»РёРІР°РµРј СЃС‚Р°СЂРѕРµ РїРѕРІРµРґРµРЅРёРµ С‚РѕР»СЊРєРѕ РґР»СЏ followed_user.
    """
    ActivityEventModel = apps.get_model("activity", "ActivityEventModel")

    queryset = ActivityEventModel.objects.filter(verb="followed_user")

    for event in queryset.iterator(chunk_size=500):
        payload = event.payload

        if not isinstance(payload, dict):
            payload = {}

        if "notification_text" in payload:
            continue

        restored_payload = dict(payload)
        restored_payload["notification_text"] = "РїС–РґРїРёСЃР°РІСЃСЏ(Р»Р°СЃСЏ) РЅР° РІР°СЃ"

        event.payload = restored_payload
        event.save(update_fields=["payload"])


class Migration(migrations.Migration):

    dependencies = [
        ("activity", "0008_alter_activityeventmodel_verb"),
    ]

    operations = [
        migrations.RunPython(
            clean_notification_text_from_activity_payload,
            restore_notification_text_to_follow_activity_payload,
        ),
    ]
