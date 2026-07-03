import { authStyles as styles } from '@/app/components/auth/auth.styles';

export default function RegisterSuccessPage() {
  return (
    <main className={styles.page}>
      <div className={styles.cardPage}>
        <section className={styles.statusCard}>
          <h1 className={styles.title}>РњР°Р№Р¶Рµ РіРѕС‚РѕРІРѕ!</h1>
          <p className={styles.description}>
            РњРё РЅР°РґС–СЃР»Р°Р»Рё Р»РёСЃС‚ С–Р· РїРѕСЃРёР»Р°РЅРЅСЏРј РґР»СЏ Р°РєС‚РёРІР°С†С–С— РѕР±Р»С–РєРѕРІРѕРіРѕ Р·Р°РїРёСЃСѓ РЅР°
            РІР°С€ email. РџРµСЂРµР№РґС–С‚СЊ Р·Р° РїРѕСЃРёР»Р°РЅРЅСЏРј, С‰РѕР± Р·Р°РІРµСЂС€РёС‚Рё СЂРµС”СЃС‚СЂР°С†С–СЋ. РЇРєС‰Рѕ
            Р»РёСЃС‚ РЅРµ РЅР°РґС–Р№С€РѕРІ РїСЂРѕС‚СЏРіРѕРј РєС–Р»СЊРєРѕС… С…РІРёР»РёРЅ, РїРµСЂРµРІС–СЂС‚Рµ РїР°РїРєСѓ В«РЎРїР°РјВ»
            Р°Р±Рѕ В«РџСЂРѕРјРѕР°РєС†С–С—В».
          </p>
        </section>
      </div>
    </main>
  );
}
