<template>
  <v-container fluid class="d-flex justify-center">
    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container col="12" fluid class="pt-0 pr-0 pl-0 pb-4">
        <h2 @click="showSpecialActions++">{{ $t('tools') }}</h2>
      </v-container>
      <v-container class="pa-0" fluid>
        <v-row>
          <!-- Tools -->
          <v-col cols="12" md="6" lg="4" xl="3" class="pb-0">
            <v-card class="pa-0">
              <v-card-title class="text-h6 mb-3">
                <v-icon color="primary" class="mr-2">mdi-tools</v-icon>
                {{ $t('tools') }}
              </v-card-title>
              <v-card-text>
                <v-btn color="primary" block class="mb-2" rounded to="/mosTools/webterminal">
                  <v-icon start>mdi-powershell</v-icon>
                  {{ $t('webterminal') }}
                </v-btn>
                <v-btn color="primary" block class="mb-2" rounded to="/mosTools/filebrowser">
                  <v-icon start>mdi-folder</v-icon>
                  {{ $t('filebrowser') }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </v-container>
</template>

<script setup>
</script>