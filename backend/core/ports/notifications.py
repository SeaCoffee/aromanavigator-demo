from typing import Optional, Dict

class NotificationsPort:
    """РРЅС‚РµСЂС„РµР№СЃ (РїРѕСЂС‚) РґР»СЏ Р»СЋР±С‹С… Р±СЌРєРµРЅРґРѕРІ СѓРІРµРґРѕРјР»РµРЅРёР№."""
    def notify(self, user_id: int, verb: str, actor_id: int, target: Optional[Dict] = None) -> None:  # pragma: no cover
        raise NotImplementedError

class NoopNotifications(NotificationsPort):
    """Р—Р°РіР»СѓС€РєР° вЂ” РЅРёС‡РµРіРѕ РЅРµ РґРµР»Р°РµС‚."""
    def notify(self, user_id: int, verb: str, actor_id: int, target: Optional[Dict] = None) -> None:
        return
