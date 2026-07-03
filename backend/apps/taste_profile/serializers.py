from rest_framework import serializers

from apps.fragrance.models import (
    BrandModel,
    FragranceModel,
    NoteModel,
    OlfactoryFamilyModel,
    PerfumerModel,
)
from apps.users.author_display import public_user_display_name

from core.choises.taste_profile_choise import (
    TasteAttitude,
    TasteConcentration,
    TasteFragranceMark,
    TastePriority,
    TasteSeason,
)
from apps.taste_profile.models import (
    TasteBrandPreferenceModel,
    TasteConcentrationPreferenceModel,
    TasteFamilyPreferenceModel,
    TasteFragranceMarkModel,
    TasteNotePreferenceModel,
    TastePerfumerPreferenceModel,
    TasteProfileModel,
    TasteSeasonPreferenceModel,
)


class BrandShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandModel
        fields = ["id", "name", "slug", "country"]


class PerfumerShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfumerModel
        fields = ["id", "name"]


class NoteShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteModel
        fields = ["id", "name", "slug"]


class FamilyShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = OlfactoryFamilyModel
        fields = ["id", "name", "slug"]


class FragranceShortSerializer(serializers.ModelSerializer):
    brand = BrandShortSerializer(read_only=True)
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = FragranceModel
        fields = [
            "id",
            "brand",
            "name",
            "slug",
            "release_year",
            "display_name",
        ]

    def get_display_name(self, obj) -> str:
        return f"{obj.brand.name} вЂ” {obj.name}"


class TasteProfileUpdateSerializer(serializers.Serializer):
    is_public = serializers.BooleanField(required=False)
    about = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=700,
    )


class TasteFamilyPreferenceSerializer(serializers.ModelSerializer):
    family = FamilyShortSerializer(read_only=True)
    attitude_label = serializers.CharField(source="get_attitude_display", read_only=True)

    class Meta:
        model = TasteFamilyPreferenceModel
        fields = [
            "id",
            "family",
            "attitude",
            "attitude_label",
            "comment",
            "created_at",
            "updated_at",
        ]


class TasteNotePreferenceSerializer(serializers.ModelSerializer):
    note = NoteShortSerializer(read_only=True)
    attitude_label = serializers.CharField(source="get_attitude_display", read_only=True)

    class Meta:
        model = TasteNotePreferenceModel
        fields = [
            "id",
            "note",
            "attitude",
            "attitude_label",
            "comment",
            "created_at",
            "updated_at",
        ]


class TastePerfumerPreferenceSerializer(serializers.ModelSerializer):
    perfumer = PerfumerShortSerializer(read_only=True)
    attitude_label = serializers.CharField(source="get_attitude_display", read_only=True)

    class Meta:
        model = TastePerfumerPreferenceModel
        fields = [
            "id",
            "perfumer",
            "attitude",
            "attitude_label",
            "comment",
            "created_at",
            "updated_at",
        ]


class TasteBrandPreferenceSerializer(serializers.ModelSerializer):
    brand = BrandShortSerializer(read_only=True)
    attitude_label = serializers.CharField(source="get_attitude_display", read_only=True)

    class Meta:
        model = TasteBrandPreferenceModel
        fields = [
            "id",
            "brand",
            "attitude",
            "attitude_label",
            "comment",
            "created_at",
            "updated_at",
        ]


class TasteSeasonPreferenceSerializer(serializers.ModelSerializer):
    season_label = serializers.CharField(source="get_season_display", read_only=True)
    attitude_label = serializers.CharField(source="get_attitude_display", read_only=True)

    class Meta:
        model = TasteSeasonPreferenceModel
        fields = [
            "id",
            "season",
            "season_label",
            "attitude",
            "attitude_label",
            "comment",
            "created_at",
            "updated_at",
        ]


class TasteConcentrationPreferenceSerializer(serializers.ModelSerializer):
    concentration_label = serializers.CharField(source="get_concentration_display", read_only=True)
    attitude_label = serializers.CharField(source="get_attitude_display", read_only=True)

    class Meta:
        model = TasteConcentrationPreferenceModel
        fields = [
            "id",
            "concentration",
            "concentration_label",
            "attitude",
            "attitude_label",
            "comment",
            "created_at",
            "updated_at",
        ]


class TasteFragranceMarkSerializer(serializers.ModelSerializer):
    fragrance = FragranceShortSerializer(read_only=True)
    mark_label = serializers.CharField(source="get_mark_display", read_only=True)
    priority_label = serializers.CharField(source="get_priority_display", read_only=True)

    class Meta:
        model = TasteFragranceMarkModel
        fields = [
            "id",
            "fragrance",
            "mark",
            "mark_label",
            "priority",
            "priority_label",
            "comment",
            "created_at",
            "updated_at",
        ]


class TasteProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    display_name = serializers.SerializerMethodField()

    family_preferences = TasteFamilyPreferenceSerializer(many=True, read_only=True)
    note_preferences = TasteNotePreferenceSerializer(many=True, read_only=True)
    perfumer_preferences = TastePerfumerPreferenceSerializer(many=True, read_only=True)
    brand_preferences = TasteBrandPreferenceSerializer(many=True, read_only=True)
    season_preferences = TasteSeasonPreferenceSerializer(many=True, read_only=True)
    concentration_preferences = TasteConcentrationPreferenceSerializer(many=True, read_only=True)
    fragrance_marks = TasteFragranceMarkSerializer(many=True, read_only=True)

    class Meta:
        model = TasteProfileModel
        fields = [
            "id",
            "user_id",
            "display_name",
            "is_public",
            "about",
            "family_preferences",
            "note_preferences",
            "perfumer_preferences",
            "brand_preferences",
            "season_preferences",
            "concentration_preferences",
            "fragrance_marks",
            "created_at",
            "updated_at",
        ]

    def get_display_name(self, obj) -> str:
        return public_user_display_name(obj.user) or ""


class TasteFamilyPreferenceCreateSerializer(serializers.Serializer):
    family_id = serializers.IntegerField()
    attitude = serializers.ChoiceField(choices=TasteAttitude.choices)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)


class TasteFamilyPreferenceUpdateSerializer(serializers.Serializer):
    family_id = serializers.IntegerField(required=False)
    attitude = serializers.ChoiceField(choices=TasteAttitude.choices, required=False)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)


class TasteNotePreferenceCreateSerializer(serializers.Serializer):
    note_id = serializers.IntegerField()
    attitude = serializers.ChoiceField(choices=TasteAttitude.choices)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)


class TasteNotePreferenceUpdateSerializer(serializers.Serializer):
    note_id = serializers.IntegerField(required=False)
    attitude = serializers.ChoiceField(choices=TasteAttitude.choices, required=False)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)


class TastePerfumerPreferenceCreateSerializer(serializers.Serializer):
    perfumer_id = serializers.IntegerField()
    attitude = serializers.ChoiceField(choices=TasteAttitude.choices)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)


class TastePerfumerPreferenceUpdateSerializer(serializers.Serializer):
    perfumer_id = serializers.IntegerField(required=False)
    attitude = serializers.ChoiceField(choices=TasteAttitude.choices, required=False)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)


class TasteBrandPreferenceCreateSerializer(serializers.Serializer):
    brand_id = serializers.IntegerField()
    attitude = serializers.ChoiceField(choices=TasteAttitude.choices)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)


class TasteBrandPreferenceUpdateSerializer(serializers.Serializer):
    brand_id = serializers.IntegerField(required=False)
    attitude = serializers.ChoiceField(choices=TasteAttitude.choices, required=False)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)


class TasteSeasonPreferenceCreateSerializer(serializers.Serializer):
    season = serializers.ChoiceField(choices=TasteSeason.choices)
    attitude = serializers.ChoiceField(choices=TasteAttitude.choices)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)


class TasteSeasonPreferenceUpdateSerializer(serializers.Serializer):
    season = serializers.ChoiceField(choices=TasteSeason.choices, required=False)
    attitude = serializers.ChoiceField(choices=TasteAttitude.choices, required=False)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)


class TasteConcentrationPreferenceCreateSerializer(serializers.Serializer):
    concentration = serializers.ChoiceField(choices=TasteConcentration.choices)
    attitude = serializers.ChoiceField(choices=TasteAttitude.choices)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)


class TasteConcentrationPreferenceUpdateSerializer(serializers.Serializer):
    concentration = serializers.ChoiceField(choices=TasteConcentration.choices, required=False)
    attitude = serializers.ChoiceField(choices=TasteAttitude.choices, required=False)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)


class TasteFragranceMarkCreateSerializer(serializers.Serializer):
    fragrance_id = serializers.IntegerField()
    mark = serializers.ChoiceField(choices=TasteFragranceMark.choices)
    priority = serializers.ChoiceField(
        choices=TastePriority.choices,
        required=False,
        default=TastePriority.NORMAL,
    )
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)


class TasteFragranceMarkUpdateSerializer(serializers.Serializer):
    fragrance_id = serializers.IntegerField(required=False)
    mark = serializers.ChoiceField(choices=TasteFragranceMark.choices, required=False)
    priority = serializers.ChoiceField(choices=TastePriority.choices, required=False)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=255)
