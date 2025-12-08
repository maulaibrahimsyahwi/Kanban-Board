"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSSOSettingsAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, data: null };

  try {
    const settings = await prisma.sSOSettings.findUnique({
      where: { userId: session.user.id },
    });
    return { success: true, data: settings };
  } catch (error) {
    return { success: false, message: "Failed to fetch SSO settings" };
  }
}

interface SSOSettingsData {
  domain?: string;
  ssoUrl?: string;
  issuer?: string;
  certificate?: string;
  forceSSO?: boolean;
  isActive?: boolean;
}

export async function updateSSOSettingsAction(data: SSOSettingsData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const existing = await prisma.sSOSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      await prisma.sSOSettings.update({
        where: { userId: session.user.id },
        data: { ...data },
      });
    } else {
      await prisma.sSOSettings.create({
        data: {
          userId: session.user.id,
          ...data,
          isActive: true,
        },
      });
    }

    if (process.env.BOXYHQ_ISSUER && process.env.BOXYHQ_API_KEY) {
      const boxyUrl = `${process.env.BOXYHQ_ISSUER}/api/v1/sso`;

      const body = {
        tenant: session.user.id,
        product: "freekanban",
        name: `SSO for ${session.user.email}`,
        description: "SSO Configuration from FreeKanban Settings",
        clientID: session.user.id,
        clientSecret: process.env.SSO_CLIENT_SECRET,
        redirectUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/boxyhq`,
        defaultRedirectUrl: `${process.env.NEXTAUTH_URL}`,
        rawMetadata: `
          <EntityDescriptor entityID="${data.issuer}">
            <IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
              <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="${data.ssoUrl}" />
              <KeyDescriptor use="signing">
                <KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
                  <X509Data>
                    <X509Certificate>${data.certificate}</X509Certificate>
                  </X509Data>
                </KeyInfo>
              </KeyDescriptor>
            </IDPSSODescriptor>
          </EntityDescriptor>
        `,
      };

      const res = await fetch(boxyUrl, {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${process.env.BOXYHQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        return {
          success: true,
          message: "Disimpan lokal, namun gagal sinkron ke SSO Provider.",
        };
      }
    }

    revalidatePath("/settings/security");
    return {
      success: true,
      message: "SSO settings saved & synced successfully",
    };
  } catch (error) {
    return { success: false, message: "Failed to save settings" };
  }
}

export async function deactivateSSOAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  try {
    const existing = await prisma.sSOSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!existing) {
      return { success: true, message: "SSO configuration closed" };
    }

    await prisma.sSOSettings.update({
      where: { userId: session.user.id },
      data: { isActive: false },
    });

    if (process.env.BOXYHQ_ISSUER && process.env.BOXYHQ_API_KEY) {
      const params = new URLSearchParams({
        tenant: session.user.id,
        product: "freekanban",
      });

      const res = await fetch(
        `${process.env.BOXYHQ_ISSUER}/api/v1/sso?${params.toString()}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Api-Key ${process.env.BOXYHQ_API_KEY}`,
          },
        }
      );

      if (!res.ok) {
        console.error("Gagal menghapus dari BoxyHQ");
      }
    }

    revalidatePath("/settings/security");
    return {
      success: true,
      message: "SSO deactivated and removed from provider",
    };
  } catch (error) {
    return { success: false, message: "Failed to deactivate SSO" };
  }
}
