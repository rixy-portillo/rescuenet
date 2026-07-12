import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create shelters
  const shelter1 = await prisma.shelter.create({
    data: {
      name: "Austin Animal Center",
      description:
        "Austin's largest open-intake animal shelter, serving the community since 2011.",
      phone: "512-978-0500",
      email: "animal.services@austintexas.gov",
      website: "https://www.austintexas.gov/austin-animal-center",
      addressLine1: "7201 Levander Loop",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
    },
  });

  const shelter2 = await prisma.shelter.create({
    data: {
      name: "LA County Animal Care",
      description:
        "Serving the animals and residents of Los Angeles County.",
      phone: "562-256-7583",
      email: "info@animalcare.lacounty.gov",
      addressLine1: "11258 S Garfield Ave",
      city: "Downey",
      state: "CA",
      zipCode: "90242",
    },
  });

  const shelter3 = await prisma.shelter.create({
    data: {
      name: "Miami-Dade Animal Services",
      description: "Providing shelter and care for Miami-Dade's animals.",
      phone: "305-884-1101",
      addressLine1: "7401 NW 74th St",
      city: "Doral",
      state: "FL",
      zipCode: "33178",
    },
  });

  // Create animals
  const animals = await Promise.all([
    prisma.animal.create({
      data: {
        shelterId: shelter1.id,
        name: "Buddy",
        externalId: "A892451",
        species: "DOG",
        breed: "Labrador Retriever",
        ageYears: 3,
        gender: "MALE",
        size: "LARGE",
        weightLbs: 65,
        color: "Yellow",
        description:
          "Buddy is a sweet, energetic Lab who loves fetch and belly rubs. Great with kids and other dogs.",
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: false,
        houseTrained: true,
        spayedNeutered: true,
        vaccinated: true,
      },
    }),
    prisma.animal.create({
      data: {
        shelterId: shelter1.id,
        name: "Whiskers",
        externalId: "A892503",
        species: "CAT",
        breed: "Domestic Shorthair",
        ageYears: 5,
        gender: "FEMALE",
        size: "MEDIUM",
        weightLbs: 10,
        color: "Tabby",
        description:
          "Whiskers is a calm, affectionate cat who loves window spots and gentle petting.",
        goodWithKids: true,
        goodWithDogs: false,
        goodWithCats: true,
        houseTrained: true,
        spayedNeutered: true,
        vaccinated: true,
      },
    }),
    prisma.animal.create({
      data: {
        shelterId: shelter2.id,
        externalId: "LA-2024-1187",
        species: "DOG",
        breed: "Pit Bull Terrier",
        breedSecondary: "Boxer",
        ageYears: 2,
        gender: "MALE",
        size: "LARGE",
        weightLbs: 55,
        color: "Brindle",
        description:
          "A strong, loyal boy who needs an experienced handler. Loves people but selective with other dogs.",
        goodWithKids: true,
        goodWithDogs: false,
        houseTrained: true,
        spayedNeutered: true,
        vaccinated: true,
        behavioralNotes: "Leash reactive with unknown dogs. Does well in structured environments.",
      },
    }),
    prisma.animal.create({
      data: {
        shelterId: shelter2.id,
        name: "Luna",
        species: "CAT",
        breed: "Siamese Mix",
        ageYears: 1,
        ageMonths: 6,
        gender: "FEMALE",
        size: "SMALL",
        weightLbs: 7,
        color: "Seal Point",
        description:
          "Luna is a playful young cat with striking blue eyes. Very social and vocal.",
        goodWithKids: true,
        goodWithCats: true,
        spayedNeutered: true,
        vaccinated: true,
      },
    }),
    prisma.animal.create({
      data: {
        shelterId: shelter3.id,
        name: "Max",
        externalId: "MD-88921",
        species: "DOG",
        breed: "German Shepherd",
        ageYears: 7,
        gender: "MALE",
        size: "LARGE",
        weightLbs: 80,
        color: "Black and Tan",
        description:
          "Senior gentleman who is calm, well-mannered, and great on leash. Loves car rides.",
        medicalNotes: "Mild arthritis, on joint supplement.",
        goodWithKids: true,
        goodWithDogs: true,
        goodWithCats: true,
        houseTrained: true,
        spayedNeutered: true,
        vaccinated: true,
        specialNeeds: "Needs joint supplements and a soft bed.",
      },
    }),
  ]);

  // Reuses real photos already sitting in the R2 bucket (from earlier manual
  // testing) rather than re-uploading — matched to each animal by species/breed.
  const photoKeysByAnimalIndex = [
    "animals/cmlixzk2500030zsbkan02dmg/0c51f72d-7faa-424d-a6b2-b972286ab974.webp", // Buddy — Labrador
    "animals/cmlixzk2600040zsbwrjumqgx/7621b428-b6b4-4cdc-b563-106e26a9b692.jpg", // Whiskers — tabby cat
    "animals/cmlixzk2700050zsb2gu9wuor/8558c9ee-6640-46bd-97a2-c12e1a94b2a1.jpg", // Pit Bull/Boxer mix
    "animals/cmlixzk2800060zsb9os1hxvc/f912508b-7295-47dc-b1a6-a26bf35fc8fe.jpg", // Luna — Siamese
    "animals/cmlixzk2900070zsb39xeeyji/cc4d5d85-63ff-466e-84df-03d67fea1a2d.jpg", // Max — German Shepherd
  ];

  await Promise.all(
    animals.map((animal, index) =>
      prisma.photo.create({
        data: {
          animalId: animal.id,
          r2Key: photoKeysByAnimalIndex[index],
          url: `${process.env.R2_PUBLIC_URL}/${photoKeysByAnimalIndex[index]}`,
          isPrimary: true,
          sortOrder: 0,
        },
      })
    )
  );

  // Create listings with varying urgency
  const now = new Date();
  const daysFromNow = (days: number) =>
    new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  await Promise.all([
    // LAST_CALL — Buddy has 28 days
    prisma.listing.create({
      data: {
        animalId: animals[0].id,
        status: "ACTIVE",
        urgency: "LAST_CALL",
        deadlineAt: daysFromNow(28),
        riskReason: "TIME_LIMIT",
        notes: "Hold period expires tomorrow. Needs rescue or foster ASAP.",
        sourceUrl: "https://www.austintexas.gov/austin-animal-center",
        verificationStatus: "VERIFIED",
        verifiedAt: now,
        publishedAt: now,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "ACTIVE",
          },
        },
      },
    }),
    // HIGH — Whiskers has 35 days
    prisma.listing.create({
      data: {
        animalId: animals[1].id,
        status: "ACTIVE",
        urgency: "HIGH",
        deadlineAt: daysFromNow(35),
        riskReason: "SPACE",
        notes: "Shelter at capacity. Cat wing is full.",
        verificationStatus: "VERIFIED",
        verifiedAt: now,
        publishedAt: now,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "ACTIVE",
          },
        },
      },
    }),
    // HIGH — unnamed pit bull, no exact deadline
    prisma.listing.create({
      data: {
        animalId: animals[2].id,
        status: "ACTIVE",
        urgency: "HIGH",
        deadlineAt: null,
        riskReason: "BEHAVIORAL",
        notes: "Needs experienced handler. Shelter cannot provide long-term behavioral support.",
        sourceUrl: "https://animalcare.lacounty.gov",
        verificationStatus: "PARTNER_SHELTER",
        verifiedAt: now,
        publishedAt: now,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "ACTIVE",
          },
        },
      },
    }),
    // MED — Luna has 45 days
    prisma.listing.create({
      data: {
        animalId: animals[3].id,
        status: "ACTIVE",
        urgency: "MED",
        deadlineAt: daysFromNow(45),
        riskReason: "SPACE",
        publishedAt: now,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "ACTIVE",
          },
        },
      },
    }),
    // LAST_CALL — Max, senior dog, 25 days
    prisma.listing.create({
      data: {
        animalId: animals[4].id,
        status: "ACTIVE",
        urgency: "LAST_CALL",
        deadlineAt: daysFromNow(25),
        riskReason: "TIME_LIMIT",
        notes: "Senior dog, hold period expiring soon. On the euthanasia list unless rescued.",
        sourceNotes: "Confirmed by shelter staff via phone call.",
        verificationStatus: "VERIFIED",
        verifiedAt: now,
        publishedAt: now,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: "ACTIVE",
          },
        },
      },
    }),
  ]);

  console.log("Seed complete!");
  console.log(`  ${3} shelters created`);
  console.log(`  ${animals.length} animals created`);
  console.log(`  ${animals.length} photos created`);
  console.log(`  ${5} listings created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
